const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

// Send a new message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, offerId } = req.body;

        // Input validation
        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        if (content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        if (content.trim().length > 1000) {
            return res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
        }

        // Validate receiver exists
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: 'Invalid receiver ID' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Can't message yourself
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot message yourself' });
        }

        const messageData = {
            sender: req.user._id,
            receiver: receiverId,
            content: content.trim()
        };

        // Optionally link to an offer
        if (offerId && mongoose.Types.ObjectId.isValid(offerId)) {
            messageData.offer = offerId;
        }

        const message = await Message.create(messageData);

        const populatedMessage = await message.populate([
            { path: 'sender', select: 'name email' },
            { path: 'receiver', select: 'name email' },
            { path: 'offer', select: 'title' }
        ]);

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get conversation with a specific user
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Get messages between current user and specified user
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ]
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('offer', 'title')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        // Mark received messages as read
        await Message.updateMany(
            { sender: userId, receiver: req.user._id, read: false },
            { read: true }
        );

        const total = await Message.countDocuments({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ]
        });

        res.json({
            messages,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all conversations (list of users with last message)
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregate to get unique conversations with last message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', userId] },
                            then: '$receiver',
                            else: '$sender'
                        }
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'otherUser'
                }
            },
            {
                $unwind: '$otherUser'
            },
            {
                $project: {
                    otherUser: {
                        _id: '$otherUser._id',
                        name: '$otherUser.name',
                        email: '$otherUser.email'
                    },
                    lastMessage: {
                        _id: '$lastMessage._id',
                        content: '$lastMessage.content',
                        createdAt: '$lastMessage.createdAt',
                        sender: '$lastMessage.sender',
                        read: '$lastMessage.read'
                    },
                    unreadCount: 1
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ message: 'Invalid sender ID' });
        }

        await Message.updateMany(
            { sender: senderId, receiver: req.user._id, read: false },
            { read: true }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a message (only sender can delete)
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Only sender can delete
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }

        await message.deleteOne();

        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadCount,
    markAsRead,
    deleteMessage
};
