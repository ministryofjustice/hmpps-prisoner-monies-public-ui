import type { Response } from 'express'

type ResSubset = Pick<Response, 'redirect' | 'render' | 'locals'>

const makeRes = (): { res: ResSubset; redirect: jest.Mock; render: jest.Mock } => {
  const redirect = jest.fn()
  const render = jest.fn()
  const res = { redirect, render, locals: { localePath: (path: string) => path } } as unknown as ResSubset
  return { res, redirect, render }
}
export default makeRes
