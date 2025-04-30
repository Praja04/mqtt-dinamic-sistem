const connection = require('../config/db'); // Koneksi ke MySQL

// Fungsi untuk simpan topic dan data ke MySQL
exports.saveTopic = (req, res) => {
  const { topic, data } = req.body; // Ambil data dari request body
  
  // Query untuk insert data ke tabel 'topics'
  const query = 'INSERT INTO topics (topic, data) VALUES (?, ?)';
  connection.query(query, [topic, data], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data' });
    }
    return res.status(200).json({ message: 'Topic berhasil disimpan' });
  });
};


exports.getTopics = (req, res) => {
  connection.query('SELECT topic, data FROM topics', (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Terjadi kesalahan' });
    }
    res.json(results);
  });
};

// Hapus topic
exports.deleteTopic = (req, res) => {
  const topic = req.params.topic;

  connection.query('DELETE FROM topics WHERE topic = ?', [topic], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Gagal menghapus topic' });
    }
    res.send({ message: 'Topic berhasil dihapus' });
  });
};

exports.createTable = (req, res) => {
  const { tableName, columns } = req.body;

  // Format query CREATE TABLE
  const query = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columns})`;

  // Eksekusi query
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error creating table:', err);
      return res.status(500).json({ message: 'Failed to create table', error: err });
    } else {
      console.log('Table created successfully:', results);
      res.status(200).json({ message: 'Table created successfully', results });
    }
  });
};
