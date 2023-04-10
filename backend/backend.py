import hashlib
import os
import sqlite3
from flask import Flask, request, jsonify
from datetime import datetime
from cryptography.fernet import Fernet

app = Flask(__name__)


def init_db():
    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute(
        '''CREATE TABLE IF NOT EXISTS journal_entries (id INTEGER PRIMARY KEY, encrypted_content TEXT, key TEXT, 
        timestamp TEXT, pinned INTEGER DEFAULT 0)''')
    conn.commit()
    conn.close()


@app.route('/api/entry', methods=['POST'])
def save_entry():
    content = request.json.get('content')
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    key = Fernet.generate_key()
    fernet = Fernet(key)
    encrypted_content = fernet.encrypt(content.encode('utf-8'))

    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute("INSERT INTO journal_entries (encrypted_content, key, timestamp) VALUES (?, ?, ?)",
              (encrypted_content, key, timestamp))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


@app.route('/api/entries', methods=['GET'])
def get_entries():
    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute("SELECT * FROM journal_entries")

    entries = []
    for row in c.fetchall():
        id = row[0]
        encrypted_content = row[1]
        key = row[2]
        timestamp = row[3]
        pinned = bool(row[4])

        # Decrypt the content using the key
        fernet = Fernet(key)
        content = fernet.decrypt(encrypted_content).decode('utf-8')

        entries.append({
            'id': id,
            'content': content,
            'timestamp': timestamp,
            'pinned': pinned
        })

    conn.close()

    entries.reverse()

    return jsonify(entries)


@app.route('/api/entry/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute("DELETE FROM journal_entries WHERE id=?", (entry_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


@app.route('/api/pin/', methods=['POST'])
def pin_entry():
    entry_id = request.json.get('entry_id')

    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute("UPDATE journal_entries SET pinned = 1 WHERE id=?", (entry_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


@app.route('/api/unpin/', methods=['POST'])
def unpin_entry():
    entry_id = request.json.get('entry_id')
    conn = sqlite3.connect('journal.db')
    c = conn.cursor()
    c.execute("UPDATE journal_entries SET pinned = 0 WHERE id=?", (entry_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "success"})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
