import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentuser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentuser.friends } },
        { isOnboarded: true }, // Only get users who are onboarded
      ],
    });
    res.status(200).json({ success: true, recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching recommended users" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );
    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ success: false, message: "Error fetching friends" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;
    if (myId === recipientId) {
      console.log("❌ Tried to send friend request to self");
      return res
        .status(400)
        .json({ success: false, message: "Invalid Request" });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log("❌ Recipient user not found in DB");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (recipient.friends.includes(myId)) {
      console.log("❌ Already friends");
      return res
        .status(400)
        .json({ success: false, message: "Already Friends!" });
    }
    const existingRequest = await FriendRequest.findOne({
      sender: myId,
      recipient: recipientId,
    });
    if (existingRequest) {
      console.log("❌ Duplicate friend request already exists");
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }
    // Optionally: Check if the recipient has sent a request to you
    const reverseRequest = await FriendRequest.findOne({
      sender: recipientId,
      recipient: myId,
    });

    if (reverseRequest) {
      console.log("ℹ️ The other user already sent you a friend request");
      return res.status(400).json({
        success: false,
        message: "The user already sent you a friend request",
      });

      // OR optionally, auto-accept and add to friends list
      // return acceptFriendRequestAutomatically(myId, recipientId); // Implement separately if needed
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
      status: "pending",
    });
    res
      .status(201)
      .json({ success: true, message: "Friend request sent", friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending friend Request",
    });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ success: false, message: "" });
    }
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
    return res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
    })
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting friend request",
    });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");
    res.status(200).json({
      success: true,
      incomingReqs:incomingRequests,
      acceptedReqs,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching friend requests",
    });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  console.log("Fetching outgoing friend requests for user id:", req.user.id);
  try {
    const myId = req.user.id;
    console.log("Getting outgoing requests for user:", myId);
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    console.log("outgoing request found:", outgoingRequests);
    res.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching outgoing friend requests",
    });
  }
}
