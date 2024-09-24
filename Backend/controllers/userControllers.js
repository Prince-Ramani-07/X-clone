const Notification = require("../models/notification");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const {cloudinary} = require("../Cloudinary/cloudinary")

const {unlink} = require("fs")

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const getProfile = async (req, res) => {
  try {
    const { id: profileID } = req.params;
    const profile = await User.findById(profileID).select("-password");
    if (!profile) {
      return res
        .status(404)
        .json({ error: "Account with this id doesn't exists" });
    }
    return res.status(200).json(profile);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const followPerson = async (req, res) => {
  try {
    const { id: profileID } = req.params;
    const userToFollow = await User.findById(profileID).select("-password");
    if (!userToFollow) {
      return res
        .status(404)
        .json({ error: "Account with this id doesn't exists" });
    }
    const me = await User.findById(req.user);
    if (userToFollow.id === me.id) {
      return res
        .status(400)
        .json({ error: "You can't follow or unfollow youself" });
    }
    const following = await me.following.includes(userToFollow.id);
    if (!following) {
      //Follow
      await User.findByIdAndUpdate(me.id, {
        $push: { following: userToFollow.id },
      });
       await User.findByIdAndUpdate(userToFollow.id, {
        $push: { followers: me.id },
      });
      const informing = new Notification({
        to: userToFollow.id,
        from: me.id,
        topic: "follow",
        read: false,
      });
      await informing.save();

      return res.status(200).json({ message: "followed successfully"});
    } else {
      //Unfollow
      await User.findByIdAndUpdate(me.id, {
        $pull: { following: userToFollow.id },
      });
     const updated =  await User.findByIdAndUpdate(userToFollow.id, {
        $pull: { followers: me.id },
      });
      await Notification.findOneAndDelete(
        { to: userToFollow.id },
        { from: me.id }
      );
      return res.status(200).json({ message: "unfollowed successfully" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const myself = await User.findById(req.user);
    const noti = await Notification.find({
      to: myself.id,
    }).populate({
      path: "from",
      select: "-password",
    });
    await Notification.updateMany(
      { to: myself.id, read: false },
      { read: true }
    );
    return res.status(200).json(noti);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    var { username, email, newpass, password, bio, links } = req.body;
    let { profilePic, banner } = req.body;
    var newPassword, newUserName;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password is required to update profile!" });
    }
    const valid = validateEmail(email);
    if (!valid) {
      return res.json({
        error: "Invalid email formate!",
      });
    }
    const user = await User.findById(req.user);
    if (user.email !== email) {
      return res.status(400).json({ error: "Invalid email!" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(404).json({ error: "Incorrect password" });
    }
    if (username) {
      username = username.trim();
      const userNameAvailable = await User.find({ username });
      if (userNameAvailable.length === 0) {
        newUserName = username;
      } else {
        return res.status(400).json({ erro: "Username already taken!" });
      }
    }
    if (newpass) {
      newpass = newpass.trim();
      newPassword = await bcrypt.hash(newpass, 10);
    }
    if (banner && user.banner) {
      await cloudinary.uploader.destroy(
        user.banner.split("/").pop().split(".")[0]
      );
      const uploadRes = await cloudinary.uploader.upload(banner);
      banner = uploadRes.secure_url;
    }
    user.username = newUserName || user.username;
    user.email = email;
    user.profilePic = profilePic || user.profilePic;
    user.banner = banner || user.banner;
    user.bio = bio || user.bio;
    user.links = bio || user.links;
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error!" });
  }
};

const findUser = async (req, res) => {
  try {
    const findUserName = req.params.name;
    const data = await User.find({
      username: { $regex: `^${findUserName}`, $options: "i" }
    });
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};

const uploadProfilePic = async(req,res)=>{
  try{
  const {user : userID}= req;
  const user = await User.findById(userID) ;
      if (user.profilePic!=="defaultXprofile.jpg") {
        const imgID= user.profilePic.split('/').slice(-1)[0].split('.')[0];
        const foldername = "X-clone/Profile_pics"
        const picID = `${foldername}/${imgID}`
       const result =  await cloudinary.uploader.destroy(picID)
      }
      const uploadRes = await cloudinary.uploader.upload(req.file.path,{
        folder : "X-clone/Profile_pics"
      });
      console.log(req.file.path)
      unlink(req.file.path,(err)=>{
          if(err){
            console.log(err)
          }
        })
        const pic = uploadRes.secure_url;
        await User.findByIdAndUpdate(userID , {profilePic : pic})
        return res.json({message : "Profile Picture updated successfully!"}).status(200)
  }catch(err){
    console.log(err)
   return res.status(500).json({error : "Internal server error!"})
  }
}

const updateBannerPic = async(req,res)=>{
  try{
  const {user : userID}= req;
  const user = await User.findById(userID) ;
      if (user.banner!=="defaultXbanner.jpg") {
        const imgID= user.banner.split('/').slice(-1)[0].split('.')[0];
        const foldername = "X-clone/Banners"
        const picID = `${foldername}/${imgID}`
       const result =  await cloudinary.uploader.destroy(picID)
       }
      const uploadRes = await cloudinary.uploader.upload(req.file.path,{
        folder : "X-clone/Banners"
      });
      unlink(req.file.path,(err)=>{
          if(err){
            console.log(err)
          }
        })
        const pic = uploadRes.secure_url;
        await User.findByIdAndUpdate(userID , {banner : pic})
        return res.json({message : "Banner updated successfully!"}).status(200)
  }catch(err){
    console.log(err)
   return res.status(500).json({error : "Internal server error!"})
  }
}

const suggestUser = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    const suggest = await User.aggregate([{ $match: { _id: { $ne: user._id, $nin: user.following } } }, { $sample: { size: 5 } }]);
    return res.status(200).json(suggest);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Internal server error!" })
  }
}
module.exports = {
  getProfile,
  followPerson,
  getUserNotifications,
  updateProfile,
  findUser,
  suggestUser,
  uploadProfilePic,
  updateBannerPic
};

