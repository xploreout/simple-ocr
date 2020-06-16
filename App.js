const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');

const worker = new TesseractWorker();
const app = express();

app.use(express.static(`${__dirname}/public`));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
}).single('canal');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', (req, res) => {
  const eng = 'eng';
  const chinese = 'chi_sim';
  const dutch = 'nld';

  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log(`Error on this: ${err}`);

      worker
        .recognize(data, `${eng}`, { tessjs_create_pdf: '1' })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          res.send(result.text);
          // res.redirect('/download');
        })
        .finally(() => worker.terminate());
    });
  });
});

app.get('/download', (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

let port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening to port ${port}`));
