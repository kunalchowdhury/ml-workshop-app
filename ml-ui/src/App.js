import { React, useState } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import AWS from 'aws-sdk';
import Papa from 'papaparse';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import staticDataCSVFile from './prices_for_postman_test_final.csv';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));


const s3_bucket ='YOUR_BUCKET_NAME_HERE';
const region ='YOUR_DESIRED_REGION_HERE';

AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY_HERE',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY_HERE'
});

const myBucket = new AWS.S3({
  params: { Bucket: s3_bucket },
  region: region,
});

function App() {
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFlaskFile,setSelectedFlaskFile] = useState(null);
  const [staticData,setStaticData] = useState([]);
  const [flaskResp,setFlaskResp] = useState([]);

  const secretKey = "secret_key";
  
  const handleFileInput = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFileToS3Bucket = () => {
    if (selectedFile) {
      const params = {
        ACL: 'public-read',
        Body: selectedFile,
        Bucket: s3_bucket,
        Key: selectedFile.name,
      };

      myBucket.putObject(params)
        .on('httpUploadProgress', (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        })
        .send((error) => {
          if (error) console.log(error);
        });

      setSelectedFile(null);
    }
  };


  const uploadFileToFlaskEndpoint = (event) => {
    // const formData = new FormData();
    // formData.append('file', selectedFlaskFile);

    fetch('http://127.0.0.1:5000/predict', {
      method: 'GET',
    })
    .then((response) => {
      return response.text();
    })
    .then((text) => {
        text=JSON.parse(text);
        // text.pltImg = <img src={text.pltImg} alt="No image found!"></img>;
        // const imgURL = text.pltImg;
        const imgURL = 'https://marketsworkshop.s3.amazonaws.com/mldata/dataplot.png';
        const img = document.createElement('img');
        img.src = imgURL;
        img.id = "plot";
        console.log(img);
        document.body.appendChild(img);

        text.pltImg = img;
        // fetch(imgURL)
        // .then(response => response.blob())
        // .then(blob => {
        //   const reader = new FileReader();
        //   reader.readAsDataURL(blob);
        //   reader.onloadend = () => {
        //     const img = document.createElement('img');
        //     img.src = reader.result;
        //     document.body.appendChild(img);

        //     text.pltImg = reader.result;
        //   }
        // })
        console.log(text);
        setFlaskResp(JSON.stringify(text,null,2));
        let res = document.getElementById("flask-resp");
        let imageplot = document.getElementById("plot");

        if(res.style.display === "none")
        {
          res.style.display = "inline";
          imageplot.style.display = "inline"
        }
        else
        {
          res.style.display = "none";
          imageplot.style.display = "none";
        }
        console.log(text);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  };

  // const file = fetch('D:/WFI/WI/React_App_S3_connection-files/prices_for_postman_test_final.csv');
  // var blob = new Blob([file], { type: "text/plain" });

  Papa.parse(staticDataCSVFile, {
    download: true,
    header: true,
    complete: (results) => {
      setStaticData(results.data);
      console.log(results.data)
    },
  });
    
  // const staticDataHandleUpload = (e) => {
  //   Papa.parse(staticDataCSVFile, {
  //     download: true,
  //     header: true,
  //     complete: (results) => {
  //       setStaticData(results.data);
  //       console.log(results.data)
  //     },
  //   });
  // };
  
  function showStaticData() {
    let table = document.getElementById("static-data-table");
    if (table.style.display === "none") {
      table.style.display = "table";
    } else {
      table.style.display = "none";
    }
  }

  return (
    <div className='container'>
      <div className='section1'>
        <label htmlFor="file-upload">
          <Button component="span">
            Select File
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />

          <Button onClick={() => uploadFileToS3Bucket(selectedFile)} variant="contained" color="primary" component="span">
            Train
          </Button>

        <div>Uploading {progress}% ...</div>
      </div>

      <div className='section2' style={{display: "flex"}}>
        <div>
          <div style={{margin: "10px"}}>
            {/* <label htmlFor="static-data-file-upload">
                <Button component="span">
                  Select File
                </Button>
            </label>
            <input 
              id="static-data-file-upload"
              accept='.csv'
              type="file" 
              style={{ display: 'none' }}
              onChange={staticDataHandleUpload} 
            /> */}

            <Button onClick={showStaticData} variant="contained" color="secondary">
              Test
            </Button>
          </div>
          <div style={{margin: "10px"}}>            
            <Button onClick={() => uploadFileToFlaskEndpoint(selectedFlaskFile)} variant="contained" color="primary" component="span">
              Process Data
            </Button>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table id="static-data-table" style={{display: "none"}} sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                {staticData.length > 0 &&
                  Object.keys(staticData[0]).map((key) => <StyledTableCell key={key} style={{backgroundColor: "black", color: "white"}}>{key.toUpperCase()}</StyledTableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {staticData.map((row, index) => (
                <StyledTableRow key={index}>
                  {Object.values(row).map((value, index) => (
                    <StyledTableCell  key={index}>{value}</StyledTableCell>
                  ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          

              <div id='flask-resp' style={{display: "none"}}>
                <pre>{flaskResp}</pre>
              </div>
      </div>
    </div>
  );
}

export default App;
