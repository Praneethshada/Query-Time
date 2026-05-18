import mongoose from "mongoose";

const questionSchema = mongoose.Schema(
  {
    text: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Classroom",
    },
    status: {
      type: String,
      required: true,
      enum: ["unanswered", "answered"],
      default: "unanswered",
    },
    isImportant: {
      type: Boolean,
      required: true,
      default: false,
    },
    answer: {
      text: { type: String },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

questionSchema.index({
  classroom: 1,
  status: 1,
  isImportant: 1,
  createdAt: -1,
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
