import { initClient } from './client';
import { initTsRest } from '..';

import { z } from 'zod';

const c = initTsRest();

export type Post = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  published: boolean;
  authorId: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
};

// Three endpoints, two for posts, and one for health
export const router = c.router({
  posts: c.router({
    getPost: c.query({
      method: 'GET',
      path: ({ id }: { id: string }) => `/posts/${id}`,
      response: c.response<Post | null>(),
      query: null,
    }),
    getPosts: c.query({
      method: 'GET',
      path: () => '/posts',
      response: c.response<Post[]>(),
      query: z.object({
        take: z.number().optional(),
        skip: z.number().optional(),
      }),
    }),
    createPost: c.mutation({
      method: 'POST',
      path: () => '/posts',
      response: c.response<Post>(),
      body: z.object({
        title: z.string(),
        content: z.string(),
        published: z.boolean().optional(),
        description: z.string().optional(),
        authorId: z.string(),
      }),
      query: null,
    }),
    mutationWithQuery: c.mutation({
      method: 'POST',
      path: () => '/posts',
      response: c.response<Post>(),
      body: z.object({}),
      query: z.object({
        test: z.string(),
      }),
    }),
    updatePost: c.mutation({
      method: 'PUT',
      path: ({ id }: { id: string }) => `/posts/${id}`,
      response: c.response<Post>(),
      body: z.object({
        title: z.string(),
        content: z.string(),
        published: z.boolean().optional(),
        description: z.string().optional(),
        authorId: z.string(),
      }),
      query: null,
    }),
    patchPost: c.mutation({
      method: 'PATCH',
      path: ({ id }: { id: string }) => `/posts/${id}`,
      response: c.response<Post>(),
      body: z.object({}),
      query: null,
    }),
    deletePost: c.mutation({
      method: 'DELETE',
      path: ({ id }: { id: string }) => `/posts/${id}`,
      response: c.response<boolean>(),
      body: null,
      query: null,
    }),
  }),
  health: c.query({
    method: 'GET',
    path: () => '/health',
    response: c.response<{ message: string }>(),
    query: null,
  }),
});

const api = jest.fn();

const client = initClient(router, {
  baseUrl: 'http://api.com',
  baseHeaders: {},
  api,
});

describe('client', () => {
  beforeEach(() => {
    api.mockClear();
  });

  describe('get', () => {
    it('w/ no parameters', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.getPosts({ query: {} });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });

    it('w/ query parameters', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.getPosts({ query: { take: 10 } });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts?take=10',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });

    it('w/ sub path', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.getPost({ params: { id: '1' } });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'GET',
        path: 'http://api.com/posts/1',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });
  });

  describe('post', () => {
    it('w/ body', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.createPost({
        body: { title: 'title', content: 'content', authorId: 'authorId' },
      });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'POST',
        path: 'http://api.com/posts',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'title',
          content: 'content',
          authorId: 'authorId',
        }),
      });
    });

    it('w/ sub path and body', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.updatePost({
        params: { id: '1' },
        body: { title: 'title', content: 'content', authorId: 'authorId' },
      });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'PUT',
        path: 'http://api.com/posts/1',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'title',
          content: 'content',
          authorId: 'authorId',
        }),
      });
    });

    it('w/ query params', async () => {
      api.mockResolvedValue({ data: {}, status: 200 });

      const result = await client.posts.mutationWithQuery({
        query: { test: 'test' },
        body: {},
      });

      expect(result).toStrictEqual({ data: {}, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'POST',
        path: 'http://api.com/posts?test=test',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('put', () => {
    it('w/ body', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.updatePost({
        params: { id: '1' },
        body: { title: 'title', content: 'content', authorId: 'authorId' },
      });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'PUT',
        path: 'http://api.com/posts/1',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'title',
          content: 'content',
          authorId: 'authorId',
        }),
      });
    });
  });

  describe('patch', () => {
    it('w/ body', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.patchPost({
        params: { id: '1' },
        body: {},
      });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'PATCH',
        path: 'http://api.com/posts/1',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('delete', () => {
    it('w/ body', async () => {
      const value = { key: 'value' };
      api.mockResolvedValue({ data: value, status: 200 });

      const result = await client.posts.deletePost({
        params: { id: '1' },
        body: null,
      });

      expect(result).toStrictEqual({ data: value, status: 200 });

      expect(api).toHaveBeenCalledWith({
        method: 'DELETE',
        path: 'http://api.com/posts/1',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });
    });
  });
});