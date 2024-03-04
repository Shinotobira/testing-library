import {render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import App from '../app'
import user from '@testing-library/user-event'
import {submitForm} from '../api'

/*Il faut créer un nouvel handler pour mocker l'api du submitForm. Pour le cas
d'erreur de l'api, elle devra renvoyer un objet { message : "les champs food et
drink sont obligatoires" } dans le cas où un des 2 champs est vide.*/

jest.mock('../api', () => ({
  submitForm: jest.fn(),
}))

test('Cas test 1', async () => {
  render(<App />)
  expect(screen.getByRole('heading')).toHaveTextContent(/Welcome home/i)
  expect(screen.getByRole('link')).toHaveTextContent(/Fill out the form/i)
  user.click(screen.getByText('Fill out the form'))

  //5 l'utilisateur est redirigé sur la page 1
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 1/i)
  let tabLink = screen.getAllByRole('link')
  //regarder si mon home est dans le tableau de lien
  expect(tabLink[0]).toHaveTextContent(/Go Home/i)
  expect(screen.getByLabelText('Favorite Food')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Food'), 'Les pâtes')
  expect(tabLink[1]).toHaveTextContent(/Next/i)
  user.click(screen.getByText('Next'))

  //12- l'utilisateur est redirigé sur la page 2
  expect(screen.getByRole('heading')).toHaveTextContent(/Page 2/i)
  tabLink = screen.getAllByRole('link')
  expect(tabLink[0]).toHaveTextContent(/Go Back/i)
  expect(screen.getByLabelText('Favorite Drink')).toBeInTheDocument()
  user.type(screen.getByLabelText('Favorite Drink'), 'Bière')
  expect(tabLink[1]).toHaveTextContent(/Review/i)
  user.click(screen.getByText('Review'))

  //l'utilisateur est redirigé sur la page de confirmation
  expect(screen.getByRole('heading')).toHaveTextContent(/Confirm/i)
  expect(screen.getByText('Please confirm your choices')).toBeInTheDocument()
  expect(screen.getByLabelText('Favorite Food')).toHaveTextContent('Les pâtes')
  expect(screen.getByLabelText('Favorite Drink')).toHaveTextContent('Bière')
  expect(screen.getByRole('link')).toHaveTextContent(/Go Back/i)
  expect(screen.getByRole('button')).toHaveTextContent(/Confirm/i)
  submitForm.mockResolvedValueOnce({message: 'Success'})
  user.click(screen.getByRole('button'))

  //27 - l'utilisateur est redirigé sur la page de Félicitation
  await waitFor(() =>
    expect(screen.getByRole('heading')).toHaveTextContent(
      /Congrats. You did it./i,
    ),
  )
  expect(screen.getByRole('link')).toHaveTextContent(/Go home/i)
  user.click(screen.getByText('Go home'))

  expect(screen.getByRole('heading')).toHaveTextContent(/Welcome home/i)
})
