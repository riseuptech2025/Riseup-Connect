import React from 'react';
import StoriesList from '../components/Stories/StoriesList';
// import PostFeed from '../components/Post/PostFeed';

const Stories = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <StoriesList />
      {/* <PostFeed /> */}
    </div>
  );
};

export default Stories;