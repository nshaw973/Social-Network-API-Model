const { Schema, Types, model } = require('mongoose');
const reactionSchema = require('./Reaction');

const thoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      require: true,
      // Max length and min length in which the the thought text can hold.
      maxlength: 200,
      minlength: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // Returns the date in a mm/dd/yyyy format.
      get: function (date) {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      },
    },
    username: {
      type: String,
      required: true,
    },
    reactions: [reactionSchema],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);

// Virtual to display the reactionCount based on the length of the Array
thoughtSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

const Thought = model('Thought', thoughtSchema);

module.exports = Thought;
