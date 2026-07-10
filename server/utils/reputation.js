import User from "../models/auth.js";
import ReputationHistory from "../models/reputationHistory.js";

export const updateReputation = async (userId, change, reason, type) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`[updateReputation] User with ID ${userId} not found.`);
      return null;
    }

    const currentReputation = user.reputation || 0;
    const newReputation = Math.max(0, currentReputation + change);
    
    // Calculate actual change if reputation was capped at 0
    const actualChange = newReputation - currentReputation;

    user.reputation = newReputation;
    await user.save();

    const logEntry = new ReputationHistory({
      userId,
      change: actualChange,
      reason,
      type
    });
    await logEntry.save();

    console.log(`[updateReputation] Updated ${user.name}'s reputation from ${currentReputation} to ${newReputation} (Change: ${actualChange}, Reason: ${reason})`);
    return user;
  } catch (error) {
    console.error(`[updateReputation] Failed to update reputation for user ${userId}:`, error);
    throw error;
  }
};
