// import your node modules
const express = require('express');
const db = require('./data/db.js');
const cors = require('cors');

// add your server code starting here
const port = 5555;
const server = express();

server.use(express.json());
server.use(cors({
    credentials:true,
}));

const sendUserError = (status, message, res) =>{
    res.status(status).json({Error:message});
    return;
};

server.get('/', (req, res) =>{
    res.send({Success: "Sanity check..."});
});

server.get('/api/posts', (req, res) =>{
    db
      .find()
        .then(posts =>{
            res.json({posts})
        })
        .catch(error =>{
            return sendUserError(500, "There was an error while retrieving these posts", res);
        })
})

server.post('/api/posts', (req, res) =>{
    console.log(req.body);
    const {title, contents} = req.body;
    if(!title||!contents){
        sendUserError(400, "Please provide title and contents for the post", res);
    }
    db
        .insert({title, contents})
        .then(posts =>{
            res.status(201).json(res)
            return;
        })
        .catch(err=>{
            sendUserError(500, "There was an error while saving this post to the database", res);
            return;
        })
})

server.get('/api/posts/:id', (req, res) =>{
    const { id } = req.params;
    
    db  
        .findById(id)
            .then(post =>{
                if(post.length===0){
                    sendUserError(404, "The post with the specified ID does not exist", res)
                    return;
                }
                res.status(200).json(post)
            })
            .catch(err=>{
                sendUserError(500, "There was an error in retrieving this post", res)
            });
})

server.delete('/api/posts/:id', (req, res) =>{
    const { id } = req.params;
    db
        .remove(id)
          .then(post =>{
              if(post.length===0){
                  sendUserError(404, "The post with the specified ID does not exist")
                  return;
              }
              res.status(200).json({Success: `${id} was successfully removed`})
          })
          .catch(err=>{
              sendUserError(500, "There was an error in removing this post", res)
          });
})

server.put('/api/posts/:id', (req, res) =>{
    const { id } = req.params;
    const { title, content } = req.body;
    if(!title||!content){
        sendUserError(400, "Please provide title and contents for the post", res);
    }
    db
        .update(id, { title, content })
            .then(post=>{
                if(post.length===0){
                    sendUserError(404, "The post with the specified ID does not exist", res)
                    return;
                }
                res.status(200).json({Success: `Post was successfully updated`})
                return;
            })
            .catch(err=>{
                sendUserError(500, "The information could not be modified", res)
            })
    })

server.get("/api/posts/:id/comments", (req, res) => {
    const { id } = req.params;
    db.findPostComments(id)
        .then(response => {
            if(response.length > 0){
                res.status(200).json(response);
            }
            else {
                res.status(400).json({Message: "Post does not have any comments"});
            }
        })
        .catch(err => {
            res.status(500).json({Error: err.message})
        })
})

server.post("/api/posts/:id/comments", async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const commentInfo = { ...body, post_id: id };
  
     try {
      const posts = await db.findById(id);
  
       if (!posts) {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      } else {
        db.insertComment(commentInfo).then(post => {
          if (commentInfo.text === "") {
            res.status(400).json({
              errorMessage: "Please provide text for the comment."
            });
          } else {
            res.status(201).json(post);
          }
        });
      }
    } catch {
      response.status(500).json({
        error: "There was an error while saving the comment to the database."
      });
    }
  });



server.listen(port, () =>{console.log(`Server is listening on port ${port}`)});
