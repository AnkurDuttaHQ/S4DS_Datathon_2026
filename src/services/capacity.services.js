import Capacity from "../models/capasity.js";


// ==========================================
// GET CAPACITY
// ==========================================

export const getCapacity = async () => {

  let capacity =
    await Capacity.findOne();


  // Create capacity document
  // automatically if it doesn't exist.

  if (!capacity) {

    capacity =
      await Capacity.create({
        totalSlots: 50,
        usedSlots: 0,
      });

  }


  return {

    totalSlots:
      capacity.totalSlots,

    usedSlots:
      capacity.usedSlots,

    remainingSlots:
      Math.max(
        0,
        capacity.totalSlots -
          capacity.usedSlots
      ),

  };
};


// ==========================================
// RESERVE ONE SLOT
// ==========================================

export const reserveSlot =
  async (session) => {

    const capacity =
      await Capacity.findOneAndUpdate(

        {
          $expr: {
            $lt: [
              "$usedSlots",
              "$totalSlots",
            ],
          },
        },

        {
          $inc: {
            usedSlots: 1,
          },
        },

        {
          new: true,
          session,
        }

      );


    if (!capacity) {

      const error =
        new Error(
          "Registration slots are full"
        );

      error.statusCode = 409;

      throw error;
    }


    return {

      totalSlots:
        capacity.totalSlots,

      usedSlots:
        capacity.usedSlots,

      remainingSlots:
        Math.max(
          0,
          capacity.totalSlots -
            capacity.usedSlots
        ),
    };
  };
// ==========================================
// RELEASE ONE SLOT
// ==========================================

export const releaseSlot =
  async (session) => {

    const capacity =
      await Capacity.findOneAndUpdate(

        {
          usedSlots: {
            $gt: 0,
          },
        },

        {
          $inc: {
            usedSlots: -1,
          },
        },

        {
          new: true,
          session,
        }

      );


    if (!capacity) {

      const error =
        new Error(
          "No occupied registration slot exists"
        );

      error.statusCode = 400;

      throw error;
    }


    return {

      totalSlots:
        capacity.totalSlots,

      usedSlots:
        capacity.usedSlots,

      remainingSlots:
        Math.max(
          0,
          capacity.totalSlots -
            capacity.usedSlots
        ),

    };
  };