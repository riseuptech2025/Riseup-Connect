import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, UserCheck, Image, Award, Star, Edit3, Camera, 
  X, Briefcase, MapPin, Globe, UserPlus, Users, Trash2, 
  Upload, Share, MessageCircle, ThumbsUp, Eye
} from 'lucide-react';
import FeedCard from '../components/feed/FeedCard';
import { usersAPI, connectionsAPI, uploadAPI } from '../services/api';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a path starting with /uploads, construct full URL
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // For filename only, construct the URL
    if (imagePath.includes('profile-') || imagePath.includes('cover-')) {
      const type = imagePath.includes('profile-') ? 'profiles' : 'covers';
      return `http://localhost:5000/uploads/${type}/${imagePath}`;
    }
    
    return null;
  };

  useEffect(() => {
    if (!currentUser) return;
    
    if (isOwnProfile) {
      setProfileUser(currentUser);
      fetchUserPosts(currentUser._id);
      setLoading(false);
    } else if (userId) {
      fetchUserProfile(userId);
      fetchUserPosts(userId);
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile(id);
      if (response.data.success) {
        const userData = response.data.data;
        // Ensure image URLs are properly formatted
        if (userData.avatar) {
          userData.avatar = getImageUrl(userData.avatar);
        }
        if (userData.coverImage) {
          userData.coverImage = getImageUrl(userData.coverImage);
        }
        setProfileUser(userData);
        setIsFollowing(userData.followers?.some(follower => follower._id === currentUser?._id) || false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (id) => {
    try {
      const response = await usersAPI.getUserPosts(id);
      if (response.data.success) {
        // Process posts to ensure image URLs are correct
        const postsWithImages = response.data.data.map(post => ({
          ...post,
          image: post.image ? getImageUrl(post.image) : null
        }));
        setPosts(postsWithImages);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await usersAPI.followUser(profileUser._id);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        setProfileUser(prev => ({
          ...prev,
          followers: response.data.isFollowing 
            ? [...prev.followers, { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar }]
            : prev.followers.filter(f => f._id !== currentUser._id)
        }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleConnect = async () => {
    try {
      await connectionsAPI.sendRequest(profileUser._id);
      alert('Connection request sent successfully!');
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleShare = async (platform) => {
    const profileUrl = window.location.href;
    const shareText = `Check out ${profileUser.name}'s profile!`;
    
    const shareConfig = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`,
      copy: () => {
        navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      }
    };

    if (platform === 'copy') shareConfig.copy();
    else window.open(shareConfig[platform]);
    
    setShowShareMenu(false);
  };

  const handleEditProfile = () => {
    setEditForm({
      name: profileUser.name,
      bio: profileUser.bio || '',
      position: profileUser.position || '',
      company: profileUser.company || '',
      location: profileUser.location || '',
      website: profileUser.website || '',
      skills: profileUser.skills?.join(', ') || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await usersAPI.updateProfile({
        ...editForm,
        skills: editForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      });
      if (response.data.success) {
        setProfileUser(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append(type === 'avatar' ? 'profileImage' : 'coverImage', file);

      const response = type === 'avatar' 
        ? await uploadAPI.uploadProfileImage(formData)
        : await uploadAPI.uploadCoverImage(formData);

      if (response.data.success) {
        // Update local state with proper URL
        const imageUrl = getImageUrl(response.data.data[type === 'avatar' ? 'avatar' : 'coverImage']);
        const updatedUser = { 
          ...profileUser, 
          [type === 'avatar' ? 'avatar' : 'coverImage']: imageUrl
        };
        setProfileUser(updatedUser);
        
        // Update auth context if it's the current user
        if (isOwnProfile) {
          updateProfile(updatedUser);
        }
        
        setShowImageMenu(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (type) => {
    try {
      setUploading(true);
      const response = type === 'avatar' 
        ? await uploadAPI.removeProfileImage()
        : await uploadAPI.removeCoverImage();

      if (response.data.success) {
        // Update local state
        const updatedUser = { 
          ...profileUser, 
          [type === 'avatar' ? 'avatar' : 'coverImage']: ''
        };
        setProfileUser(updatedUser);
        
        // Update auth context if it's the current user
        if (isOwnProfile) {
          updateProfile(updatedUser);
        }
        
        setShowImageMenu(null);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert(error.response?.data?.message || 'Error removing image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      handleImageUpload(file, type);
    }
    event.target.value = ''; // Reset input
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
    { id: 'about', label: 'About', icon: UserCheck },
    { id: 'media', label: 'Media', icon: Image, count: posts.filter(p => p.image).length },
    { id: 'highlights', label: 'Highlights', icon: Star }
  ];

  const MobileActionSheet = ({ isOpen, onClose, children }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-4 lg:hidden"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-800/20 border border-${color}-200 dark:border-${color}-700 rounded-xl p-3 text-center cursor-pointer transition-all hover:shadow-md flex-1 min-w-[120px]`}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 mb-2`}>
        <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className={`text-xl font-bold text-${color}-700 dark:text-${color}-300 mb-1`}>{value}</div>
      <div className={`text-xs font-medium text-${color}-600 dark:text-${color}-400`}>{label}</div>
    </motion.div>
  );

  const InfoItem = ({ icon: Icon, label, value, href }) => (
    value ? (
      <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          {href ? (
            <a 
              href={href.startsWith('http') ? href : `https://${href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium truncate block text-sm"
            >
              {value}
            </a>
          ) : (
            <p className="text-gray-900 dark:text-white font-medium truncate text-sm">{value}</p>
          )}
        </div>
      </div>
    ) : null
  );

  const ImageMenu = ({ type, onClose }) => (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
        >
          <h3 className="text-lg font-semibold mb-4">
            {type === 'avatar' ? 'Profile Picture' : 'Cover Image'}
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                if (type === 'avatar') {
                  profileInputRef.current?.click();
                } else {
                  coverInputRef.current?.click();
                }
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              disabled={uploading}
            >
              <Upload className="h-5 w-5" />
              <span>Upload New Photo</span>
            </button>

            {(type === 'avatar' ? profileUser?.avatar : profileUser?.coverImage) && (
              <button
                onClick={() => handleRemoveImage(type)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                disabled={uploading}
              >
                <Trash2 className="h-5 w-5" />
                <span>Remove Current Photo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          {uploading && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Uploading...
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  const renderTabContent = () => {
    const tabContent = {
      posts: (
        <div className="space-y-4">
          {posts.length > 0 ? posts.map((post, index) => (
            <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <FeedCard post={post} />
            </motion.div>
          )) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {isOwnProfile ? "Share your thoughts, experiences, or projects with your network." : "This user hasn't shared any posts yet."}
              </p>
            </motion.div>
          )}
        </div>
      ),
      
      about: isEditing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-3">
              {['name', 'bio', 'position', 'company', 'location', 'website', 'skills'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field}</label>
                  {field === 'bio' ? (
                    <textarea
                      value={editForm[field]}
                      onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editForm[field]}
                      onChange={(e) => setEditForm({...editForm, [field]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex space-x-3 mt-4">
              <button onClick={handleSaveProfile} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Eye} label="Posts" value={posts.length} color="blue" />
            <StatCard icon={ThumbsUp} label="Likes" value={posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0)} color="green" />
            <StatCard icon={MessageCircle} label="Comments" value={posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0)} color="purple" />
            <StatCard icon={UserCheck} label="Followers" value={profileUser?.followers?.length || 0} color="orange" />
          </div>

          {profileUser?.bio && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profileUser.bio}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <div className="space-y-2">
              <InfoItem icon={Briefcase} label="Works as" value={profileUser?.position && profileUser?.company ? `${profileUser.position} at ${profileUser.company}` : null} />
              <InfoItem icon={MapPin} label="Location" value={profileUser?.location} />
              <InfoItem icon={Globe} label="Website" value={profileUser?.website} href={profileUser?.website} />
            </div>
          </div>

          {profileUser?.skills?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),

      media: (() => {
        const mediaPosts = posts.filter(post => post.image);
        return mediaPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {mediaPosts.map((post, index) => (
              <motion.div key={post._id} whileHover={{ scale: 1.05 }} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer">
                <img src={post.image} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No media yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isOwnProfile ? "You haven't shared any media yet." : "No media shared yet."}
            </p>
          </div>
        );
      })(),

      highlights: (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Achievements & Highlights</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {isOwnProfile ? "Your achievements and featured content will appear here." : "User highlights and achievements will be displayed here."}
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Top Contributor</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3">
              <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Rising Star</div>
            </div>
          </div>
        </div>
      )
    };

    return tabContent[activeTab] || null;
  };

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', className = '' }) => (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition-colors ${
        variant === 'primary' 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );

  const renderCoverImage = () => (
    <div 
      className="h-32 md:h-48 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl relative overflow-hidden bg-cover bg-center"
      style={{ 
        backgroundImage: profileUser?.coverImage ? `url(${profileUser.coverImage})` : 'none'
      }}
    >
      {isOwnProfile && (
        <button 
          onClick={() => setShowImageMenu('cover')}
          className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center space-x-1 shadow-lg"
        >
          <Camera className="h-3 w-3" />
          <span>{profileUser?.coverImage ? 'Edit' : 'Add Cover'}</span>
        </button>
      )}
    </div>
  );

  const renderAvatar = () => (
    <div className="relative">
      <div 
        className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-xl ${
          profileUser?.avatar ? 'bg-cover bg-center' : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}
        style={{ 
          backgroundImage: profileUser?.avatar ? `url(${profileUser.avatar})` : 'none'
        }}
      >
        {!profileUser?.avatar && (profileUser?.name?.charAt(0).toUpperCase() || 'U')}
      </div>
      
      {isOwnProfile && (
        <button 
          onClick={() => setShowImageMenu('avatar')}
          className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Camera className="h-3 w-3 md:h-4 md:w-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-2xl h-32 md:h-48"></div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 px-4">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900"></div>
              <div className="space-y-2 pb-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* File inputs */}
      <input 
        type="file" 
        ref={profileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'avatar')}
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'cover')}
      />
      
      {/* Image menu */}
      {showImageMenu && (
        <ImageMenu 
          type={showImageMenu} 
          onClose={() => setShowImageMenu(null)} 
        />
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
        {renderCoverImage()}

        <div className="px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-20">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {renderAvatar()}

              <div className="pb-4 flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profileUser?.name}</h1>
                  {profileUser?.verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {profileUser?.position && profileUser?.company && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm md:text-base">
                    {profileUser.position} at {profileUser.company}
                  </p>
                )}

                <div className="flex space-x-6 md:hidden">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{posts.length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{profileUser?.followers?.length || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{profileUser?.following?.length || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="hidden md:flex space-x-3 pb-4">
                <ActionButton 
                  onClick={handleFollow}
                  icon={isFollowing ? UserCheck : UserPlus}
                  label={isFollowing ? 'Following' : 'Follow'}
                  variant={isFollowing ? 'secondary' : 'primary'}
                />
                <ActionButton onClick={handleConnect} icon={Users} label="Connect" variant="secondary" />
                <ActionButton onClick={() => setShowShareMenu(true)} icon={Share} variant="secondary" className="w-12" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {!isOwnProfile && (
        <div className="flex space-x-3 mb-6 md:hidden">
          <ActionButton 
            onClick={handleFollow}
            icon={isFollowing ? UserCheck : UserPlus}
            label={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'secondary' : 'primary'}
            className="flex-1"
          />
          <ActionButton onClick={handleConnect} icon={Users} label="Connect" variant="secondary" className="flex-1" />
          <ActionButton onClick={() => setShowShareMenu(true)} icon={Share} variant="secondary" className="w-12" />
        </div>
      )}

      {isOwnProfile && (
        <div className="flex space-x-3 mb-6">
          <ActionButton onClick={handleEditProfile} icon={Edit3} label="Edit Profile" variant="primary" className="flex-1" />
          <ActionButton onClick={() => setShowShareMenu(true)} icon={Share} variant="secondary" className="w-12" />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6 sticky top-2 z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full text-xs min-w-[20px]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      <MobileActionSheet isOpen={showShareMenu} onClose={() => setShowShareMenu(false)}>
        <h3 className="text-lg font-semibold mb-4 text-center">Share Profile</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { platform: 'twitter', label: 'Twitter', bg: 'bg-blue-400', content: '𝕏' },
            { platform: 'linkedin', label: 'LinkedIn', bg: 'bg-blue-600', content: 'in' },
            { platform: 'whatsapp', label: 'WhatsApp', bg: 'bg-green-500', content: 'WA' },
            { platform: 'copy', label: 'Copy Link', bg: 'bg-gray-500', content: <Share className="h-6 w-6 text-white" /> }
          ].map(({ platform, label, bg, content }) => (
            <button key={platform} onClick={() => handleShare(platform)} className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                {typeof content === 'string' ? <span className="text-white font-bold">{content}</span> : content}
              </div>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowShareMenu(false)} className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium">
          Cancel
        </button>
      </MobileActionSheet>
    </div>
  );
};

export default Profile;