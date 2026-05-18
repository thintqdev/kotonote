import mongoose from 'mongoose';

const listeningExerciseSchema = new mongoose.Schema({
  titleVi: {
    type: String,
    required: true,
  },
  titleJa: {
    type: String,
    default: '',
  },
  jlpt: {
    type: String,
    enum: ['N1', 'N2', 'N3', 'N4', 'N5'],
    default: 'N3',
  },
  type: {
    type: String,
    enum: ['task', 'point', 'summary', 'utterance', 'response'],
    default: 'task',
  },
  duration: {
    type: Number,
    default: 0,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  scriptJa: {
    type: String,
    default: '',
  },
  scriptVi: {
    type: String,
    default: '',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 1,
  },
  questions: [{
    questionVi: {
      type: String,
      default: '',
    },
    questionJa: {
      type: String,
      default: '',
    },
    choices: [{
      type: String,
      default: '',
    }],
    choiceImages: [{
      type: String,
      default: '',
    }],
    answerIndex: {
      type: Number,
      default: 0,
    },
    explainVi: {
      type: String,
      default: '',
    }
  }]
}, {
  timestamps: true,
});

export default mongoose.model('ListeningExercise', listeningExerciseSchema);
