import Question from "../models/questionModel.js";
import Classroom from "../models/classroomModel.js";
import { getIo } from "../realtime/socket.js";

const isTeacherForClass = (userId, classroom) =>
  userId.toString() === classroom.teacher.toString();

const isStudentInClass = (userId, classroom) =>
  classroom.students?.some(
    (studentId) => studentId.toString() === userId.toString(),
  );

const normalizeQuestion = (questionDoc) => {
  const plain = questionDoc.toObject
    ? questionDoc.toObject()
    : { ...questionDoc };

  if (plain.status === "important") {
    plain.status = "unanswered";
    plain.isImportant = true;
  }

  if (plain.isImportant === undefined) {
    plain.isImportant = false;
  }

  if (plain.status !== "answered") {
    plain.status = "unanswered";
  }

  return plain;
};

const toTeacherQuestion = (questionDoc) => normalizeQuestion(questionDoc);

const toStudentQuestion = (questionDoc) => {
  const plain = normalizeQuestion(questionDoc);
  delete plain.author;
  return plain;
};

const emitQuestionEvent = (
  classId,
  eventName,
  teacherQuestion,
  studentQuestion,
) => {
  const io = getIo();
  io.to(`${classId}:teacher`).emit(eventName, {
    classId,
    question: teacherQuestion,
  });
  io.to(`${classId}:student`).emit(eventName, {
    classId,
    question: studentQuestion,
  });
};

const emitClassEvent = (classId, eventName) => {
  const io = getIo();
  io.to(`${classId}:teacher`).emit(eventName, { classId });
  io.to(`${classId}:student`).emit(eventName, { classId });
};

// Get questions for a specific classroom (teacher sees author, students do not)
export const getQuestionsForClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    const isTeacher = isTeacherForClass(req.user._id, classroom);
    const isStudent = isStudentInClass(req.user._id, classroom);

    if (!isTeacher && !isStudent) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these questions" });
    }

    const filterValue = req.query.filter || req.query.status || "";
    let filter = {};

    if (filterValue === "answered") {
      filter = { status: "answered" };
    } else if (filterValue === "unanswered") {
      filter = { status: "unanswered" };
    } else if (filterValue === "important") {
      filter = { $or: [{ isImportant: true }, { status: "important" }] };
    }
    const classroomFilter = { classroom: req.params.classId };

    let query = Question.find({ ...filter, ...classroomFilter }).sort({
      createdAt: "desc",
    });

    if (isTeacher) {
      const questions = await query.populate("author", "name");
      return res.json(questions.map((question) => toTeacherQuestion(question)));
    }

    const questions = await query;
    const sanitized = questions.map((question) => toStudentQuestion(question));
    return res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Function to clear all questions for a specific class
export const clearQuestionsForClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    if (!isTeacherForClass(req.user._id, classroom)) {
      return res
        .status(403)
        .json({ message: "Not authorized to clear questions" });
    }

    await Question.deleteMany({ classroom: req.params.classId });
    emitClassEvent(req.params.classId, "question:cleared");
    res.json({ message: "All questions for this class have been cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createQuestion = async (req, res) => {
  const { text } = req.body;
  const { classId } = req.params;

  const classroom = await Classroom.findById(classId);
  if (!classroom) {
    return res.status(404).json({ message: "Classroom not found" });
  }
  const canPost =
    isTeacherForClass(req.user._id, classroom) ||
    isStudentInClass(req.user._id, classroom);
  if (!canPost) {
    return res
      .status(403)
      .json({ message: "Not authorized to post in this class" });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Question text cannot be empty." });
  }

  // DUPLICATE CHECK: Look for a question with the same text (case-insensitive) in the same class
  const existingQuestion = await Question.findOne({
    classroom: classId,
    text: { $regex: `^${text.trim()}$`, $options: "i" },
  });

  if (existingQuestion) {
    // If the question exists, return a 409 Conflict error
    return res
      .status(409)
      .json({ message: "This question has already been asked." });
  }

  // If no duplicate is found, create the new question
  const question = new Question({
    text,
    author: req.user._id,
    classroom: classId,
  });

  const createdQuestion = await question.save();
  const populatedQuestion = await Question.findById(
    createdQuestion._id,
  ).populate("author", "name");
  const teacherQuestion = toTeacherQuestion(populatedQuestion);
  const studentQuestion = toStudentQuestion(populatedQuestion);

  emitQuestionEvent(
    classId,
    "question:created",
    teacherQuestion,
    studentQuestion,
  );

  const isTeacher = isTeacherForClass(req.user._id, classroom);
  res.status(201).json(isTeacher ? teacherQuestion : studentQuestion);
};

export const updateQuestionStatus = async (req, res) => {
  const { status } = req.body;
  const question = await Question.findById(req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  if (question.status === "important") {
    question.status = "unanswered";
    question.isImportant = true;
  }
  const classroom = await Classroom.findById(question.classroom);
  if (!classroom || !isTeacherForClass(req.user._id, classroom)) {
    return res
      .status(401)
      .json({ message: "Only the teacher can update status" });
  }
  if (status === "important") {
    question.isImportant = !question.isImportant;
  } else if (status === "answered") {
    question.status = "answered";
  } else {
    question.status = "unanswered";
  }
  const updatedQuestion = await question.save();
  const populatedQuestion = await Question.findById(
    updatedQuestion._id,
  ).populate("author", "name");
  const teacherQuestion = toTeacherQuestion(populatedQuestion);
  const studentQuestion = toStudentQuestion(populatedQuestion);
  const classId = question.classroom.toString();

  emitQuestionEvent(
    classId,
    "question:status-updated",
    teacherQuestion,
    studentQuestion,
  );
  res.json(teacherQuestion);
};

export const updateQuestionAnswer = async (req, res) => {
  const { text } = req.body;
  const question = await Question.findById(req.params.questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  const classroom = await Classroom.findById(question.classroom);
  if (!classroom || !isTeacherForClass(req.user._id, classroom)) {
    return res
      .status(401)
      .json({ message: "Only the teacher can answer questions" });
  }

  const trimmed = text?.trim();
  if (trimmed) {
    question.answer = {
      text: trimmed,
      updatedAt: new Date(),
    };
    question.status = "answered";
  } else {
    question.answer = null;
    question.status = "unanswered";
  }

  const updatedQuestion = await question.save();
  const populatedQuestion = await Question.findById(
    updatedQuestion._id,
  ).populate("author", "name");
  const teacherQuestion = toTeacherQuestion(populatedQuestion);
  const studentQuestion = toStudentQuestion(populatedQuestion);
  const classId = question.classroom.toString();

  emitQuestionEvent(
    classId,
    "question:answer-updated",
    teacherQuestion,
    studentQuestion,
  );
  res.json(teacherQuestion);
};
