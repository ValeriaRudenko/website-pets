const mongoose = require('mongoose');
const fs = require('fs');
const puppeteer = require('puppeteer');

const commentSchema = new mongoose.Schema({
    content: String,
    author: String,
});

const Comment = mongoose.model('Comment', commentSchema);

// Connect to MongoDB
mongoose
    .connect('mongodb://127.0.0.1:27017/petsdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log('Connected to MongoDB');
        // Generate HTML table
        const html = await generateHTMLTable();

        // Save HTML table to a file
        fs.writeFile('comments_table.html', html, (err) => {
            if (err) throw err;
            console.log('HTML table file created: comments_table.html');
        });

        // Convert HTML to PDF
        await convertHTMLToPDF(html, 'comments_table.pdf');

        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

async function generateHTMLTable() {
    try {
        // Retrieve all comments from the collection
        const comments = await Comment.find();

        // Generate HTML table
        let html = '<table>\n';
        html += '<thead>\n<tr><th>Content</th><th>Author</th></tr>\n</thead>\n';
        html += '<tbody>\n';
        comments.forEach((comment) => {
            html += `<tr><td>${comment.content}</td><td>${comment.author}</td></tr>\n`;
        });
        html += '</tbody>\n';
        html += '</table>';

        return html;
    } catch (error) {
        console.error('Error generating HTML table:', error);
        throw error;
    }
}

async function convertHTMLToPDF(html, outputPath) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set the page content and wait for network idle
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF
        await page.pdf({ path: outputPath, format: 'A4' });

        console.log('PDF file created:', outputPath);

        await browser.close();
    } catch (error) {
        console.error('Error converting HTML to PDF:', error);
        throw error;
    }
}
