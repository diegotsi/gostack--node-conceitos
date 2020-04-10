const express = require('express');
const cors = require('cors');
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Verify if repo exists
// if not return an error
// if yes call next to continue

function validateRepoExists(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repo not found' });
  }

  response.locals = { repositoryIndex };

  return next();
}

function validadeRepoId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid project ID.' });
  }

  return next();
}

// applying middlewares
app.use('/repositories/:id', validadeRepoId, validateRepoExists);

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put('/repositories/:id', (request, response) => {
  const { title, url, techs } = request.body;
  const { repositoryIndex } = response.locals;

  const repo = { ...repositories[repositoryIndex], title, url, techs };

  repositories[repositoryIndex] = repo;

  return response.json(repo);
});

app.delete('/repositories/:id', (request, response) => {
  const { repositoryIndex } = response.locals;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { repositoryIndex } = response.locals;
  const currentLikes = repositories[repositoryIndex].likes;

  const repo = {
    ...repositories[repositoryIndex],
    likes: currentLikes + 1,
  };

  repositories[repositoryIndex] = repo;

  return response.json(repo);
});

module.exports = app;
