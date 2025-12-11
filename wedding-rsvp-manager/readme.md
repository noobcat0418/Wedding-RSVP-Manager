# 💍 Wedding RSVP Manager

A beautiful, fully-featured wedding RSVP management system built with React. Create stunning digital wedding invitations, manage guest lists, and track RSVPs all in one place.

![Wedding RSVP Manager](https://img.shields.io/badge/React-18.x-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## ✨ Features

### 📋 Wedding Management
- Create and manage multiple weddings
- Card and table view for wedding list
- Wedding status tracking (Upcoming, This Week, This Month, Completed)
- Unique RSVP links generated for each wedding
- Delete weddings with confirmation

### 🎨 Full Customization
- **Theme & Colors**: Primary/secondary colors, gradient backgrounds
- **Background Photo**: Upload custom images for invitation backdrop
- **Font Styles**: Choose from Elegant Serif, Modern Sans, Romantic, or Classic
- **Invitation Text**: Customize header, footer, and all messaging
- **RSVP Questions**: Add, edit, delete custom questions (text, textarea, dropdown, radio)
- **Thank You Page**: Personalize the post-submission confirmation

### 👥 Guest Management
- Add individual guests (First Name, Last Name, Email, Phone)
- **CSV Import**: Bulk import guests with column mapping
- Filter guests by status (Attending, Declined, Maybe, Not Invited)
- Track guest responses and plus-ones
- Delete guests individually

### 💌 Invitation System
- **Email Templates**: Customizable subject and body with variables
- **SMS Templates**: Short message format with character count
- **Template Variables**: `{{name}}`, `{{couple}}`, `{{date}}`, `{{time}}`, `{{venue}}`, `{{rsvpLink}}`
- Select specific guests to send invitations
- Track sent invitations (Email/SMS status)

### 📊 Analytics & Tracking
- Real-time RSVP statistics
- Attendance breakdown (Yes, No, Maybe)
- Total attending count (including plus-ones)
- Invitation funnel (Total → Invited → Viewed → Responded)

### 🔗 RSVP Form (Guest-Facing)
- Beautiful, mobile-responsive design
- Guest name search functionality
- Dynamic form based on custom questions
- Themed to match wedding colors
- Confirmation page after submission

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wedding-rsvp-manager.git
cd wedding-rsvp-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 📁 Project Structure

```
wedding-rsvp-manager/
├── src/
│   ├── components/
│   │   └── WeddingRSVP.jsx    # Main component
│   ├── App.jsx                 # App entry
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles (Tailwind)
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **PapaParse** - CSV parsing
- **Vite** - Build tool

## 📖 Usage Guide

### Creating a Wedding

1. Click **"+ New Wedding"** on the home screen
2. Click on the wedding card to open the dashboard
3. Go to **"Details"** tab to fill in wedding information
4. Use **"Customize"** tab to design your invitation

### Customizing Your Invitation

Navigate to the **Customize** tab where you'll find four sections:

| Section | Description |
|---------|-------------|
| 🎨 Theme & Colors | Set colors, gradients, background photo, fonts |
| ✏️ Invitation Text | Edit header, footer, RSVP page text |
| ❓ RSVP Questions | Add/edit questions guests will answer |
| 🎉 Thank You Page | Customize confirmation message |

### Importing Guests via CSV

1. Go to **"Guests"** tab
2. Click **"📥 Import CSV"**
3. Upload your CSV file
4. Map columns: First Name, Last Name, Email, Phone
5. Click **"Import"**

**CSV Format Example:**
```csv
First Name,Last Name,Email,Phone
John,Doe,john@email.com,555-0101
Jane,Smith,jane@email.com,555-0102
```

### Sending Invitations

1. Go to **"Send Invites"** tab
2. Edit your Email or SMS template
3. Click **"Send Emails"** or **"Send SMS"**
4. Select guests to receive invitations
5. Click **"Send"**

### Sharing RSVP Link

Copy the RSVP link from:
- Wedding card on home screen
- Dashboard header
- Overview tab

Share this link with all your guests. They'll search for their name and submit their RSVP.

## ⚙️ Configuration

### Changing the RSVP Domain

In `WeddingRSVP.jsx`, find the `createWedding` function and update:

```javascript
rsvpLink: `https://yourdomain.com/rsvp/${rsvpId}`,
```

### Default Questions

Modify the `defaultQuestions` array to change the pre-set RSVP questions:

```javascript
const defaultQuestions = [
  { id: 'attending', type: 'radio', label: 'Will you be attending?', ... },
  // Add or modify questions here
];
```

## 🎨 Color Themes

Built-in color options:
- 🌹 Rose
- 💜 Purple  
- 💙 Blue
- 🌊 Teal
- 💚 Green
- 🧡 Orange
- 💗 Pink
- 💎 Indigo

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Data Storage

Currently, data is stored in React state (browser memory). For production use, you should integrate with a backend:

- Firebase
- Supabase
- Custom REST API
- MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons from native SVG
- Font styles from system fonts
- Color palette inspired by modern wedding themes

---

Made with ❤️ for couples everywhere
