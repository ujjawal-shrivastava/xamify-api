const { auth } = require("../middlewares");
const axios = require("axios");
const { Blob } = require("buffer");
//express
const express = require("express");
const router = express.Router();

//prisma
const {
    PrismaClient,
    UserType,
    AssessmentType,
    QuestionType,
} = require("@prisma/client");

const prisma = new PrismaClient();

const submissionFields = {
    id: true,
    type: true,
    createdAt: true,
    student: {
        select: {
            id: true,
            name: true,
            email: true,
            profile: {
                select: {
                    rollNo: true,
                    course: {
                        select: {
                            name: true,
                        },
                    },
                    year: {
                        select: {
                            label: true,
                        },
                    },
                },
            },
        },
    },
    assessment: {
        select: {
            id: true,
            startTime: true,
            endTime: true,
            type: true,
            subject: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
    answers: {
        select: {
            id: true,
            text: true,
            choice: {
                select: {
                    id: true,
                    text: true,
                },
            },
            images: {
                select: {
                    id: true,
                    data: true,
                },
            },
            question: {
                select: {
                    id: true,
                    type: true,
                    text: true,
                    choices: {
                        select: {
                            id: true,
                            text: true,
                        },
                    },
                },
            },
        },
    },
};

router.get("/assessment/:assessmentId", auth(), async(req, res, next) => {
    try {
        if (req.user.type == UserType.TEACHER) {
            const submissions = await prisma.submission.findMany({
                where: {
                    assessmentId: req.params.assessmentId,
                },
                select: {
                    id: true,
                    type: true,
                    createdAt: true,
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    rollNo: true,
                                },
                            },
                        },
                    },
                },
            });
            res.send(submissions);
        } else {
            const submission = await prisma.submission.findUnique({
                where: {
                    studentId_assessmentId: {
                        assessmentId: req.params.assessmentId,
                        studentId: req.user.id,
                    },
                },
                select: {
                    id: true,
                    type: true,
                    createdAt: true,
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    rollNo: true,
                                },
                            },
                        },
                    },
                },
            });
            res.send(submission);
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                id: req.params.id,
            },
            select: submissionFields,
        });
        if (
            req.user.type == UserType.TEACHER ||
            submission.student.id == req.user.id
        ) {
            res.send(submission);
        } else {
            throw Error("Current user does not have this submission");
        }
    } catch (err) {
        next(err);
    }
});

router.get("/:id/pdf", auth(), async(req, res, next) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                id: req.params.id,
            },
            select: submissionFields,
        });
        if (
            req.user.type == UserType.TEACHER ||
            submission.student.id == req.user.id
        ) {
            axios
                .post(process.env.PDF_API_URL, {
                    submission: submission,
                    headers: {
                        Accept: "application/pdf",
                    },
                })
                .then((pdfRes) => {
                    const pdf = Buffer.from(pdfRes.data.buffer, "base64");
                    res.set({
                        "Content-Type": "application/pdf",
                        "Content-Length": pdf.length,
                        "Content-Disposition": `attachment; filename=${submission.student.profile.rollNo}.pdf`,
                    });
                    res.send(pdf);
                })
                .catch((error) => {
                    next(error);
                });
        } else {
            throw Error("Current user does not have this submission");
        }
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.STUDENT }), async(req, res, next) => {
    try {
        const { assessmentId, answers } = req.body;
        const submission = await prisma.$transaction(async(prisma) => {
            const student = await prisma.user.findUnique({
                where: {
                    email: req.user.email,
                },
                select: {
                    id: true,
                    type: true,
                    profile: {
                        select: {
                            rollNo: true,
                            year: true,
                            course: true,
                        },
                    },
                },
            });
            if (student.type != UserType.STUDENT)
                throw new Error("Current user is not Student`");

            const assessment = await prisma.assessment.findUnique({
                where: {
                    id: assessmentId,
                },
                select: {
                    id: true,
                    type: true,
                    author: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                            course: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            year: {
                                select: {
                                    id: true,
                                    label: true,
                                },
                            },
                        },
                    },
                    startTime: true,
                    endTime: true,
                    questions: {
                        select: {
                            id: true,
                            type: true,
                            text: true,
                            choices: {
                                select: {
                                    id: true,
                                    text: true,
                                },
                            },
                        },
                    },
                },
            });

            if (
                student.profile.year.id != assessment.subject.year.id ||
                student.profile.course.id != assessment.subject.course.id
            )
                throw new Error(
                    "Student is not eligible for taking assessment of this subject"
                );
            // validate submission time
            const currentTime = new Date();
            const startTime = new Date(assessment.startTime);
            const endTime = new Date(assessment.endTime);
            var type;
            if (currentTime < startTime) throw new Error("Invalid submission time");
            else if (currentTime >= endTime) {
                type = "OFFLINE";
            } else {
                type = "ONLINE";
            }

            // validate answers
            var answersData = [];
            answers.forEach((answer) => {
                const ques = assessment.questions.find(
                    (x) => x.id == answer.questionId
                );
                if (ques.type == QuestionType.MCQ) {
                    if (assessment.type != AssessmentType.DIGITAL)
                        throw new Error("MCQ Answers are only allowed in DIGITAL Mode");
                    answersData.push({
                        question: {
                            connect: {
                                id: answer.questionId,
                            },
                        },
                        choice: {
                            connect: {
                                id: answer.choiceId,
                            },
                        },
                    });
                } else if (ques.type == QuestionType.TYPE) {
                    if (assessment.type != AssessmentType.DIGITAL)
                        throw new Error("TYPED Answers are only allowed in DIGITAL Mode");
                    answersData.push({
                        question: {
                            connect: {
                                id: answer.questionId,
                            },
                        },
                        text: answer.text,
                    });
                } else if (ques.type == QuestionType.IMAGE) {
                    if (assessment.type != AssessmentType.WRITTEN)
                        throw new Error("IMAGE Answers are only allowed in WRITTEN Mode");
                    answersData.push({
                        question: {
                            connect: {
                                id: answer.questionId,
                            },
                        },
                        images: {
                            createMany: { data: answer.images },
                        },
                    });
                } else {
                    throw new Error("Invalid Question Type");
                }
            });
            console.log(answersData);
            const submission = await prisma.submission.create({
                data: {
                    type: type,
                    student: {
                        connect: {
                            id: student.id,
                        },
                    },
                    assessment: {
                        connect: {
                            id: assessment.id,
                        },
                    },
                    answers: {
                        create: answersData,
                    },
                },
                select: submissionFields,
            });
            return submission;
        });
        res.send(submission);
    } catch (err) {
        next(err);
    }
});

module.exports = router;