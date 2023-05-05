const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    username: {
      type: String,
      // Only one username can exist
      Unique: true,
      // Cannot be empty
      required: true,
      // removes whitespace
      Trimmed: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Using regex to make sure the email contains lowecase letters, and has an @ as well as a .com or org
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: 'Please enter a valid email',
      },
    },
    // Will contain all the thoughts IDs
    thoughts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Thought',
      },
    ],
    // Contains all the friends IDs
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);
// This will return a virtual that shows the length of the friends list and says how many friends the user has. Done on the client side.
userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

const User = model('User', userSchema);

module.exports = User;
