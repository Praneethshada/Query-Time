import Question from "../models/questionModel.js";
import Classroom from "../models/classroomModel.js";
import { getIo } from "../realtime/socket.js";

// Get questions for a specific classroom (TEACHER ONLY)
export const getQuestionsForClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    if (req.user._id.toString() !== classroom.teacher.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these questions" });
    }

    const filter = req.query.status ? { status: req.query.status } : {};
    const classroomFilter = { classroom: req.params.classId };

    const questions = await Question.find({ ...filter, ...classroomFilter })
      .populate("author", "name")
      .sort({ createdAt: "desc" });
    res.json(questions);
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
    if (req.user._id.toString() !== classroom.teacher.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to clear questions" });
    }

    await Question.deleteMany({ classroom: req.params.classId });
    getIo().to(req.params.classId).emit("question:cleared", {
      classId: req.params.classId,
    });
    res.json({ message: "All questions for this class have been cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const createQuestion = async (req, res) => {
  const { text } = req.body;
  const { classId } = req.params;

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

  getIo().to(classId).emit("question:created", {
    classId,
    question: populatedQuestion,
  });

  res.status(201).json(populatedQuestion);
};

export const updateQuestionStatus = async (req, res) => {
  const { status } = req.body;
  const question = await Question.findById(req.params.questionId);
  const classroom = await Classroom.findById(question.classroom);
  if (req.user._id.toString() !== classroom.teacher.toString()) {
    return res
      .status(401)
      .json({ message: "Only the teacher can update status" });
  }
  if (question) {
    question.status = status;
    const updatedQuestion = await question.save();
    const populatedQuestion = await Question.findById(
      updatedQuestion._id,
    ).populate("author", "name");
    getIo().to(question.classroom.toString()).emit("question:status-updated", {
      classId: question.classroom.toString(),
      question: populatedQuestion,
    });
    res.json(populatedQuestion);
  } else {
    res.status(404).json({ message: "Question not found" });
  }
};
