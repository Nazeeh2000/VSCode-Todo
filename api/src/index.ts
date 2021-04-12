require('dotenv-safe').config();
import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { __prod__ } from './constants';
import { join } from 'path';
import { User } from './entities/User';
import { Strategy as GitHubStrategy } from 'passport-github';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { Todo } from './entities/Todo';
import { isAuth } from './isAuth';

const main = async () => {
  await createConnection({
    type: 'postgres',
    // dropSchema: true,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // database: 'vstodo',
    // username: 'postgres',
    // password: '5616',
    entities: [join(__dirname, './entities/*.*')],
    logging: !__prod__,
    synchronize: !__prod__,
  });

  // const user = await User.create({ name: 'bob' }).save();

  // console.log({ user });

  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(passport.initialize());
  app.use(express.json());

  passport.serializeUser((user: any, done) => {
    done(null, user.accessToken);
  });

  passport.use(
    new GitHubStrategy(
      {
        // @ts-ignore
        clientID: process.env.GITHUB_CLIENT_ID_PROD,
        // @ts-ignore
        clientSecret: process.env.GITHUB_CLIENT_SECRET_PROD,
        // callbackURL: 'http://postgres://hgiueknkwealkg:6a382a99f911a05dfdfda03a1b239e5cfc1d8c044554006db43dd816343be0ce@ec2-54-145-102-149.compute-1.amazonaws.com:5432/d8eh5hft7lpmrp/auth/github/callback',
        // callbackURL: `http://${process.env.DATABASE_URL}/auth/github/callback`
        callbackURL: 'https://fast-temple-05523.herokuapp.com/auth/github/callback'
        // callbackURL: 'http://localhost:3002/auth/github/callback',
      },
      async (_: any, __: any, profile: any, cb: any) => {
        let user = await User.findOne({ where: { githubId: profile.id } });
        if (user) {
          user.name = profile.displayName;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            githubId: profile.id,
          }).save();
        }

        cb(null, {
          accessToken: jwt.sign(
            { userId: user.id },
            // @ts-ignore
            process.env.ACCESS_TOKEN_SECRET,
            // 'sdhbjshj',
            {
              expiresIn: '1y',
            }
          ),
        });
      }
    )
  );

  app.get('/auth/github', passport.authenticate('github', { session: false }));

  app.get(
    '/auth/github/callback',
    passport.authenticate('github', { session: false }),
    (req: any, res) => {
      // Successful authentication, redirect home.
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  app.get('/todo', isAuth, async (req, res) => {
    const todos = await Todo.find({
      where: { creatorId: req.userId },
      order: { id: 'DESC' },
    });
    res.send({ todos });
  });

  app.post('/todo', isAuth, async (req, res) => {
    // console.log(req.body);
    const todo = await Todo.create({
      text: req.body.text,
      creatorId: req.userId,
    }).save();
    res.send({ todo });
  });

  app.put('/todo', isAuth, async (req, res) => {
    const todo = await Todo.findOne(req.body.id);

    if (!todo) {
      res.send({ todo: null });
      return;
    }

    if (todo.creatorId !== req.userId) {
      throw new Error('Not authorized');
    }
    todo.completed = !todo.completed;
    await todo.save();
    res.send({ todo });
  });

  // Delete todo code
  app.put('/todo-delete', isAuth, async (req, res) => {
    const todo = await Todo.findOne(req.body.id);

    if (!todo) {
      res.send({ todo: null });
      return;
    }

    if (todo.creatorId !== req.userId) {
      throw new Error('Not authorized');
    }
    // todo.completed = !todo.completed;
    await Todo.delete(req.body.id);
    res.send({ deleted: true });
  });

  app.get('/me', async (req, res) => {
    // Bearer sjdkjkfdjlkkn
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.send({ user: null });
      return;
    }

    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.send({ user: null });
      return;
    }

    let userId = '';
    try {
      // @ts-ignore
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      userId = payload.userId;
    } catch (e) {
      console.log(e);
    }

    if (!userId) {
      res.send({ user: null });
      return;
    }

    const user = await User.findOne(userId);
    res.send({ user });
  });

  app.get('/', (_req, res) => {
    res.send('hello');
  });

  app.listen(parseInt(process.env.PORT!), () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
  // app.listen(3002, () => {
  //   console.log('Listening on port 3002');
  // });
};

main();
