import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useApolloClient, useMutation } from '@apollo/client';

import { useForm } from '../util/hooks';
import { FETCH_POSTS_QUERY } from '../util/graphql';

function PostForm({}) {
  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: ''
  });
  const client = useApolloClient();
  const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      });
      const modifiedData = {
        ...data,
        getPosts: [result.data.createPost, ...data.getPosts]
      }  
      proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: {  ...modifiedData },});
      //setPosts(modifiedData.getPosts)
      values.body = '';
    },
    onError: (error) => {
      console.log(error)
    }
  });

  function createPostCallback() {
    createPost();
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <h2>Create a post:</h2>
        <Form.Field>
          <Form.Input
            placeholder="Hi World!"
            name="body"
            onChange={onChange}
            value={values.body}
            error={error ? true : false}
          />
          <Button type="submit" color="teal">
            Submit
          </Button>
        </Form.Field>
      </Form>
      {error && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            {error.graphQLErrors.map((err) => <li>{err.message}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
      user {
        id
        username
        profilePicture
      }
    }
  }
`;

export default PostForm;
