const accountService = require('../services/accountService');

const accountController = {
  getProfile: async (req, res) => {
    try {
      // User is already attached to req by auth middleware
      return res.status(200).json({ 
        success: true, 
        user: {
          _id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          businessName: req.user.businessName,
          userType: req.user.userType,
          phoneNumber: req.user.phoneNumber,
          address: req.user.address,
          bio: req.user.bio,
          profileImage: req.user.profileImage,
          isEmailVerified: req.user.isEmailVerified,
          preferences: req.user.preferences,
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
  },
  
  updateProfile: async (req, res) => {
    try {
      const updatedUser = await accountService.updateProfile(req.user._id, req.body);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  },
  
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      
      await accountService.changePassword(req.user._id, currentPassword, newPassword);
      
      return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      console.error('Error changing password:', error);
      return res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  },
  
  updateNotificationSettings: async (req, res) => {
    try {
      const updatedUser = await accountService.updateNotificationSettings(req.user._id, req.body);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Notification settings updated successfully',
        preferences: updatedUser.preferences
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return res.status(500).json({ success: false, message: 'Failed to update notification settings' });
    }
  },
  
  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required to delete account' });
      }
      
      await accountService.deleteAccount(req.user._id, password);
      
      return res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      if (error.message === 'Password is incorrect') {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      console.error('Error deleting account:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
  }
};

module.exports = accountController;
