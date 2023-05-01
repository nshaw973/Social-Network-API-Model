const { Schema, Types } = require('mongoose');

const thoughtSchema = new Schema(
  {
    thougtText: {
      type: String,
      require: true,
      maxlength: 200,
      minlength: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    username: {
      type: String,
      required: true,
    },
    reactions: {
      type: Array,
    },
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);
