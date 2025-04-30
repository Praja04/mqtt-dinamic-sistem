const express = require('express');
const cors = require('cors');
const configRoutes = require('./routes/configRoutes');
require('./mqttWorker');
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Izinkan akses dari frontend
app.use(express.json()); // Ganti bodyParser.json() dengan express.json()



// Routing
app.use(configRoutes);

// Jalankan server  
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
