const mqtt = require('mqtt');
const mysql = require('mysql2');

// Koneksi ke database MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'project_hmi',
});

// Koneksi ke broker MQTT
const mqttClient = mqtt.connect('mqtt://localhost');

// Fungsi ambil topik dari DB
const getTopicsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT topic, data FROM topics', (err, results) => {
      if (err) reject(err);
      else resolve(results); // Mengambil topik beserta data dari DB
    });
  });
};

// Fungsi untuk mendapatkan kolom dari tabel
const getTableColumns = (table) => {
  return new Promise((resolve, reject) => {
    connection.query(`SHOW COLUMNS FROM \`${table}\``, (err, results) => {
      if (err) reject(err);
      else resolve(results.map(col => col.Field)); // Mengambil kolom tabel
    });
  });
};

// Fungsi untuk menyimpan data ke dalam tabel
const storeData = async (table, dataObj) => {
  try {
    const allowedColumns = await getTableColumns(table); // Kolom yang valid
    const filteredData = {};

    // Ambil hanya data yang sesuai dengan kolom yang ada
    for (const key of Object.keys(dataObj)) {
      if (allowedColumns.includes(key)) {
        filteredData[key] = dataObj[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      console.log('No valid columns to insert.');
      return;
    }

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;

    connection.query(query, values, (err) => {
      if (err) {
        console.error(`Error inserting data into ${table}:`, err);
      } else {
        console.log(`Data inserted into ${table} successfully`);
      }
    });
  } catch (err) {
    console.error('Error preparing insert statement:', err);
  }
};

// Saat terkoneksi ke MQTT
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  getTopicsFromDatabase()
    .then((topics) => {
      topics.forEach((topic) => {
        mqttClient.subscribe(topic.topic, (err) => { // Subscribe berdasarkan topik dari DB
          if (err) {
            console.error(`Failed to subscribe to topic ${topic.topic}:`, err);
          } else {
            console.log(`Subscribed to topic: ${topic.topic}`);
          }
        });
      });
    })
    .catch((err) => {
      console.error('Error fetching topics from database:', err);
    });
});

// Saat menerima pesan dari topik
mqttClient.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}:`, message.toString());

  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    console.error('Invalid JSON:', err);
    return;
  }

  // Ambil data yang sesuai dari DB berdasarkan topik
  getTopicsFromDatabase()
    .then((topics) => {
      const topicData = topics.find(t => t.topic === topic);
      if (topicData) {
        // Jika topik ditemukan, ambil data dari kolom 'data' untuk tabel yang sesuai
        const tableName = topicData.data; // Mengambil nilai data (misalnya nama tabel) dari DB
        storeData(tableName, data); // Simpan data ke tabel yang sesuai
      } else {
        console.error(`No data found for topic ${topic}`);
      }
    })
    .catch((err) => {
      console.error('Error fetching topic data from database:', err);
    });
});

// Tangani error MQTT
mqttClient.on('error', (err) => {
  console.error('Error with MQTT client:', err);
});
