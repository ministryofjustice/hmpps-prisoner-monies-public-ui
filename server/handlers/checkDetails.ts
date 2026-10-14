import type { RequestHandler } from 'express'

const checkDetailsGetHandler: RequestHandler = (req, res) => {
  return res.render('pages/check-details', {
    prisonerNumber: req.session.sendMoney?.prisonerNumber,
    amount: req.session.sendMoney?.amount,
  })
}

export default checkDetailsGetHandler
