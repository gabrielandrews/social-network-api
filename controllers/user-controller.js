const { User, Thought } = require('../models');
const { db } = require('../models/Thought');

const userController = {
    addUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(500).json(err));
    },
    getAllUsers(req, res) {
        User.find({})
            .populate({ path: 'friends', select: '-__v'})
            .populate({ path: 'thoughts', select: '-__v'})
            .select('-__v')
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },
    getUserById({ params }, res) {
        User.findOne({ _id: params.id })
        .populate({ path: 'friends', select: '-__v'})
        .populate({ path: 'thoughts', select: '-__v'})
        .select('-__v')
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'user not found'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
    },
    updateUser({ params, body }, res) {
        User.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'user not found'});
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    },
    deleteUser({ params }, res) {
        User.findById(params.id)
            .then(dbUserData => {
                if(!dbUserData) {
                    res.status(404).json({ message: 'user not found'});
                    return;
                }
                Thought.deleteMany({ _id: { $in: dbUserData.thoughts} }).then(dbUserData.delete())
                    .then( () => res.status(202).json({message: 'thoughts deleted'}));
            })
            .catch(err => {
                res.status(500).json(err)})
    },
    addFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $push: { friends: params.friendId }},
            { new: true, runValidators: true }
        )
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'user not found' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.status(500).json(err));
    },
    deleteFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            { $pull: { friends: params.friendId }},
            { new: true, runValidators: true }
        )
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'user not found' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.status(500).json(err));
    }
}

module.exports = userController;