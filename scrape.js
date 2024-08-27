const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const xlsx = require('xlsx');

// Fetch and save page data
const fetch = async () => {
    try {
        const response = await axios.get('https://internshala.com/jobs/jobs-in-pune/', {
            headers: {
                "Content-Type": "text/html"
            }
        });

        if (response.status === 200) {
            const data = response.data;
            fs.writeFileSync('data.json', data);
            console.log("File successfully written");
        } else {
            console.error(`Failed to fetch data. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

// Uncomment to fetch data
fetch();

// Process the saved data
const processData = () => {
    try {
        if (!fs.existsSync('data.json')) {
            console.error('data.json file does not exist.');
            return;
        }

        const data = fs.readFileSync('data.json').toString();
        console.log("Raw HTML Content:");
        console.log(data); // Print raw HTML content

        const $ = cheerio.load(data);

        // Extract job titles
        const titles = $('.job-internship-name');
        // console.log(titles);
        const jobTitles = [];
        titles.each((index, job) => {
            jobTitles.push($(job).text().trim());
        });
        console.log("Job Titles:", jobTitles);

        // Extract company names
        const companies = $('.company-name');
        const companyNames = [];
        companies.each((index, comp) => {
            companyNames.push($(comp).text().trim());
        });
        console.log("Company Names:", companyNames);

        // Extract locations
        const locations = $('.row-1-item.locations span a');
        const locationArray = [];
        locations.each((index, loca) => {
            locationArray.push($(loca).text().trim());
        });
        console.log("Locations:", locationArray);

        // Extract posted dates
        const postDates = $('.status-success span');
        const postedDates = [];
        postDates.each((index, item) => {
            postedDates.push($(item).text().trim());
        });
        console.log("Posted Dates:", postedDates);

        // Create JSON data
        const details = jobTitles.map((title, index) => ({
            title: title || 'N/A',
            company: companyNames[index] || 'N/A',
            location: locationArray[index] || 'N/A',
            posted_date: postedDates[index] || 'N/A'
        }));

        console.log("Details:", details);

        // Save JSON data
        fs.writeFileSync('job.json', JSON.stringify(details, null, 2));
        console.log("JSON file created successfully!");

        // Create Excel file
        const workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet(details);
        xlsx.utils.book_append_sheet(workbook, sheet, "Job_Detail");
        xlsx.writeFile(workbook, 'job.xlsx');
        console.log("XLSX file created successfully!");

    } catch (error) {
        console.error("Error processing data:", error);
    }
};

// Uncomment to process data
processData();
