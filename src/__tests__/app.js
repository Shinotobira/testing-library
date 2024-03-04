import {render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import App from '../app'
import user from '@testing-library/user-event'
import {server} from '../../tests/server'

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

function checkTab(tabLink, text) {
  let result = false
  for (let i = 0; i < tabLink.length; i++) {
    if (tabLink[i].textContent === text) {
      result = true
    }
  }
  return result
}

test('Cas test 1', async () => {
  let result
  render(<App />)
  expect(screen.getByRole('heading')).toHaveTextContent(/Welcome home/i)
  expect(screen.getByRole('link')).toHaveTextContent(/Fill out the form/i)
  user.click(screen.getByText('Fill out the form'))

  //Redirection sur la page 1
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 1/i)
  let tabLink = screen.getAllByRole('link')
  result = checkTab(tabLink, 'Go Home')
  expect(result).toBeTruthy()
  expect(screen.getByLabelText('Favorite Food')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Food'), 'Les pâtes')
  result = checkTab(tabLink, 'Next')
  expect(result).toBeTruthy()
  user.click(screen.getByText('Next'))

  //Redirection sur la page 2
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 2/i)
  tabLink = screen.getAllByRole('link')
  result = checkTab(tabLink, 'Go Back')
  expect(result).toBeTruthy()
  expect(screen.getByLabelText('Favorite Drink')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Drink'), 'Bière')
  result = checkTab(tabLink, 'Review')
  expect(result).toBeTruthy()
  user.click(screen.getByText('Review'))

  //Redirection sur la page de confirmation
  expect(screen.getByRole('heading')).toHaveTextContent(/Confirm/i)
  expect(screen.getByText('Please confirm your choices')).toBeInTheDocument()
  expect(screen.getByLabelText('Favorite Food')).toHaveTextContent('Les pâtes')
  expect(screen.getByLabelText('Favorite Drink')).toHaveTextContent('Bière')
  expect(screen.getByRole('link')).toHaveTextContent(/Go Back/i)
  expect(screen.getByRole('button')).toHaveTextContent(/Confirm/i)
  //appelle de la fonction submitForm
  user.click(screen.getByRole('button'))

  //Redirection sur la page de Félicitation
  await waitFor(() =>
    expect(screen.getByRole('heading')).toHaveTextContent(
      /Congrats. You did it./i,
    ),
  )
  expect(screen.getByRole('link')).toHaveTextContent(/Go home/i)
  user.click(screen.getByText('Go home'))

  //Redirection sur la page Home
  expect(screen.getByRole('heading')).toHaveTextContent(/Welcome home/i)
})

test('Cas test 2', async () => {
  render(<App />)
  expect(screen.getByRole('heading')).toHaveTextContent(/Welcome home/i)
  expect(screen.getByRole('link')).toHaveTextContent(/Fill out the form/i)
  user.click(screen.getByText('Fill out the form'))

  //Redirection sur la page 1
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 1/i)
  let tabLink = screen.getAllByRole('link')
  let result
  result = checkTab(tabLink, 'Go Home')
  expect(result).toBeTruthy()
  expect(screen.getByLabelText('Favorite Food')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Food'), '')
  result = checkTab(tabLink, 'Next')
  expect(result).toBeTruthy()
  user.click(screen.getByText('Next'))

  //Redirection sur la page 2
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 2/i)
  tabLink = screen.getAllByRole('link')
  result = checkTab(tabLink, 'Go Back')
  expect(result).toBeTruthy()
  expect(screen.getByLabelText('Favorite Drink')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Drink'), 'Bière')
  result = checkTab(tabLink, 'Review')
  expect(result).toBeTruthy()
  user.click(screen.getByText('Review'))

  //Redirection sur la page de confirmation
  expect(screen.getByRole('heading')).toHaveTextContent(/Confirm/i)
  expect(screen.getByText('Please confirm your choices')).toBeInTheDocument()
  expect(screen.getByLabelText('Favorite Food')).toHaveTextContent('')
  expect(screen.getByLabelText('Favorite Drink')).toHaveTextContent('Bière')
  expect(screen.getByRole('link')).toHaveTextContent(/Go Back/i)
  expect(screen.getByRole('button')).toHaveTextContent(/Confirm/i)

  user.click(screen.getByRole('button'))

  await waitFor(() =>
    expect(screen.getByText('Oh no. There was an error.')).toBeInTheDocument(),
  )
  expect(
    screen.getByText('les champs food et drink sont obligatoires'),
  ).toBeInTheDocument()
  tabLink = screen.getAllByRole('link')
  result = checkTab(tabLink, 'Go Home')
  expect(result).toBeTruthy()
  result = checkTab(tabLink, 'Try again')
  expect(result).toBeTruthy()
  user.click(screen.getByText('Try again'))

  //Redirection sur la page 1
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 1/i)
})
