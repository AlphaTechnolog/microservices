import express, { type Request, type Response } from 'express'

const app = express();

app.get('/buy/:product', (req, res) => {
  const { product }: { product: string } = req.params;
  res.status(200).json({
    product,
    amount: Math.trunc(Math.random() * 11),
  })
})

app.listen(8080, () => {
  console.log('Server is listening at port 8080')
})