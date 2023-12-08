const dynamoose = require('dynamoose');
const { BlogPost } = require('../models/blogPost'); // Assuming your blog post model is defined in 'models/blogPost.js'

const homeStartingContent = 'The home page lists all the blogs from all the users.';

const composePost = async (req, res) => {
  try {
    const { postTitle, postBody } = req.body;

    // Create a new post using Dynamoose
    const newPost = new BlogPost({
      postId: 'unique_post_id', // Set a unique identifier for the post
      username: req.user.username,
      title: postTitle,
      content: postBody,
    });

    await newPost.save();

    res.redirect('/post');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post.');
  }
};

const displayAllPosts = async (req, res) => {
  try {
    // Fetch all posts from DynamoDB using Dynamoose method
    const posts = await BlogPost.scan().exec();

    res.render('home', {
      startingContent: homeStartingContent,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching posts.');
  }
};

const displayPost = async (req, res) => {
  try {
    const requestedPostId = req.params.postId;

    // Fetch the specific post from DynamoDB using Dynamoose method
    const post = await BlogPost.get({ postId: requestedPostId });

    res.render('post', {
      title: post.title,
      content: post.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching post.');
  }
};

module.exports = {
  displayAllPosts,
  displayPost,
  composePost,
};
