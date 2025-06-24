# InsureBuy
# InsureBuy QA Project Dashboard
This is a single-page interactive web application designed to provide a comprehensive and easily explorable overview of the Quality Assurance (QA) project plan for InsureBuy. It serves as a dynamic dashboard, presenting key metrics, workload distribution, an interactive backlog, and test type distribution, all within an intuitive user interface.

# Features
Project at a Glance (KPIs): High-level summary of total epics, user stories, and overall project progress with a clear percentage and a donut chart.

Epic Workload Distribution: A horizontal bar chart illustrating the number of user stories assigned to each epic, helping to identify major areas of development.

Interactive QA Backlog: A detailed, filterable list of user stories, presented as Kanban-style cards. Users can filter stories by priority (High, Medium, Low) to focus on specific tasks.

Test Type Distribution: A donut chart showing the breakdown of QA effort across different testing categories (Functional, UI/UX, Performance, Security).

Responsive Design: The dashboard is designed to be fully responsive and optimized for viewing on various devices (desktop, tablet, mobile).

Pure Frontend: Built entirely with HTML, CSS (Tailwind CSS), and Vanilla JavaScript, making it easy to deploy and host statically.

Data Visualization: Utilizes Chart.js for all dynamic data visualizations, ensuring clear and interactive charts.

# Technology Stack
HTML5: For the core structure and content.

Tailwind CSS (CDN): For utility-first styling and responsive layout.

JavaScript (Vanilla JS): For all interactive logic, data manipulation, and dynamic content updates.

Chart.js (CDN): For rendering interactive and responsive charts on HTML Canvas elements.

# How to Use
Simply open the index.html file in any modern web browser. The dashboard will load automatically, displaying all project information.

Explore KPIs: View the top section for an immediate overview of project status.

Analyze Epic Breakdown: Refer to the bar chart to understand which epics have the most user stories.

Filter Backlog: Use the "All," "High," "Medium," and "Low" buttons above the backlog to filter user stories by their priority. Click a button again or "All" to reset the filter.

Review Test Distribution: See the donut chart at the bottom for insights into the types of testing being performed.

# Project Structure
The project is structured within a single index.html file, containing all HTML, inline CSS for specific components, and JavaScript logic. This makes it self-contained and easy to deploy.

Deployment
This dashboard is a static web application and can be easily hosted on platforms like:

GitHub Pages: Ideal for simple static sites.

# Netlify: Offers continuous deployment from Git repositories.

Vercel: Similar to Netlify, focused on developer experience.

Any other static site hosting provider.

# To deploy using GitHub Pages:

Create a new public GitHub repository (e.g., insurebuy-qa-dashboard).

Upload the index.html file and any accompanying css/ and js/ folders (if you decide to externalize them, though this version is single-file) directly to the root of your repository.

Go to your repository's "Settings" -> "Pages".

Select the main (or master) branch as the source and ensure the folder is set to / (root).

Click "Save". Your site will be live at https://yourusername.github.io/your-repository-name/ within minutes.

# Contributing
As this is a self-contained dashboard generated for a specific report, direct contributions are not applicable. However, feel free to adapt and extend this code for your own projects.
