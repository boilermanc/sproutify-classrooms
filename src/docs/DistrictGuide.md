# District Management Guide 🌐

A comprehensive guide to managing school districts in Sproutify Classrooms, including teacher onboarding, school management, and district-wide analytics.

---

## Table of Contents

- [What is a District?](#what-is-a-district)
- [Getting Started](#getting-started)
  - [Creating a District](#creating-a-district)
  - [District Administrator Setup](#district-administrator-setup)
- [Teacher Onboarding](#teacher-onboarding)
  - [Method 1: District Join Codes](#method-1-district-join-codes)
  - [Method 2: Email Invitations](#method-2-email-invitations)
- [Managing Schools](#managing-schools)
- [District Features](#district-features)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## What is a District?

A **district** in Sproutify Classrooms is a collection of schools that work together to manage aeroponic gardens across multiple locations. Districts provide:

- **Centralized Management**: District administrators can oversee all schools and teachers
- **Unified Reporting**: View analytics and progress across the entire district
- **Easy Teacher Onboarding**: Streamlined process for adding new teachers
- **Resource Sharing**: Share best practices and curriculum across schools
- **Scalable Growth**: Add new schools and teachers as your program expands

### District Hierarchy

```
District
├── School A
│   ├── Teacher 1
│   ├── Teacher 2
│   └── Teacher 3
├── School B
│   ├── Teacher 4
│   └── Teacher 5
└── School C
    └── Teacher 6
```

### District Join Code Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRICT ADMINISTRATOR                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1. Creates District Account
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 DISTRICT DASHBOARD                          │
│  • Generate Join Code: ABC123                              │
│  • Manage Schools                                          │
│  • Invite Teachers                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 2. Shares Join Code
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      TEACHER                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 3. Registers with Join Code
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                TEACHER REGISTRATION                         │
│  • Enter Personal Info                                     │
│  • Enter School Name                                        │
│  • Enter District Join Code: ABC123                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 4. System Validates & Links
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUTOMATIC PROCESSING                      │
│  ✓ Validates Join Code                                      │
│  ✓ Links School to District                                 │
│  ✓ Sets Teacher's district_id                              │
│  ✓ Grants District Access                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Creating a District

To create a new district:

1. **Navigate to Registration**: Go to the Sproutify Classrooms registration page
2. **Select School Plan**: Choose the "School" subscription plan
3. **Choose District Tab**: Select "District" instead of "School" in the registration form
4. **Enter District Information**:
   - District Name (e.g., "Springfield School District")
   - Administrator contact information
   - Billing details
5. **Complete Registration**: Finish the signup process

After registration, you'll receive:
- District administrator access
- A unique district join code
- Access to district management features

### District Administrator Setup

Once your district is created:

1. **Access District Dashboard**: Log in and navigate to `/district`
2. **Configure District Settings**: Update contact information, logo, and settings
3. **Generate Join Code**: Your district join code is automatically created
4. **Share Join Code**: Provide the code to schools in your district

---

## Teacher Onboarding

There are two primary ways to add teachers to your district:

### Method 1: District Join Codes

**Best for**: Schools with multiple teachers or when you want teachers to self-register

#### For Teachers:
1. **Get the Join Code**: Obtain the district join code from your district administrator
2. **Register with Code**: During teacher registration:
   - Enter your personal information
   - Enter your school name
   - **Enter the district join code** in the "District join code" field
   - Complete registration
3. **Automatic Linking**: Your school will be automatically linked to the district

#### Visual Guide:
```
┌─ Teacher Registration Form ─────────────────┐
│ First Name: [John]                        │
│ Last Name: [Smith]                         │
│ School Name: [Roosevelt Elementary]        │
│ District Join Code: [ABC123] ← Enter here! │
│ Email: [john@school.edu]                   │
│ Password: [••••••••]                       │
└─────────────────────────────────────────────┘
```

#### For District Administrators:
1. **Share Join Code**: Provide the code to schools via email, meetings, or documentation
2. **Monitor Registrations**: Watch for new teachers joining your district
3. **Verify School Linking**: Ensure schools are properly linked to your district

### Method 2: Email Invitations

**Best for**: Individual teacher invitations or when you have specific teacher information

#### For District Administrators:
1. **Navigate to Teachers**: Go to District → Teachers
2. **Click "Invite Teacher"**: Open the invitation dialog
3. **Enter Teacher Information**:
   - Teacher's email address
   - Full name (optional)
   - Assign to specific school (optional)
4. **Send Invitation**: The system generates an invitation link
5. **Share Link**: Send the invitation link to the teacher

#### For Teachers:
1. **Receive Invitation**: Check your email for the invitation link
2. **Click Link**: Follow the invitation link to the registration page
3. **Complete Registration**: Fill out the form with your information
4. **Automatic Setup**: You'll be automatically added to the district and assigned school

---

## Managing Schools

### Adding Schools to Your District

Schools can be added to your district in several ways:

1. **Automatic Addition**: When teachers register with your join code, their schools are automatically added
2. **Manual Addition**: District administrators can manually add schools
3. **School Linking**: Existing schools can be linked to your district

### School Management Features

- **View All Schools**: See all schools in your district
- **School Details**: View teacher counts, tower counts, and activity
- **School Reports**: Generate reports for individual schools
- **School Settings**: Manage school-specific settings

---

## District Features

### Dashboard Overview

The district dashboard provides:
- **Total Schools**: Number of schools in your district
- **Total Teachers**: Number of active teachers
- **Total Towers**: Number of aeroponic towers across all schools
- **Activity Charts**: Visual representation of district-wide activity

### Teacher Management

- **View All Teachers**: See teachers across all schools
- **Search and Filter**: Find specific teachers by name, school, or email
- **Invite New Teachers**: Send invitations to new teachers
- **Teacher Activity**: Monitor teacher engagement and activity

### Reporting and Analytics

- **District Reports**: Comprehensive reports across all schools
- **School Comparisons**: Compare performance between schools
- **Growth Tracking**: Monitor district-wide growth and adoption
- **Export Data**: Export reports for external analysis

### Settings and Configuration

- **District Information**: Update district name, contact info, and branding
- **Join Code Management**: View and regenerate district join codes
- **Subscription Management**: Manage district subscription and billing
- **Privacy Settings**: Configure data sharing and privacy options

---

## Troubleshooting

### Common Issues

#### Invalid District Join Code
**Problem**: Teacher receives "Invalid district join code" error
**Solutions**:
- Verify the code with your district administrator
- Check for typos (codes are case-sensitive)
- Ensure the code hasn't expired
- Try regenerating the join code

#### School Not Linked to District
**Problem**: School exists but isn't linked to the district
**Solutions**:
- The system automatically links schools when teachers register with valid join codes
- Contact support if automatic linking fails
- Manually link the school through district settings

#### Missing District Features
**Problem**: Teacher doesn't see district features after registration
**Solutions**:
- Verify the teacher's profile has `district_id` set
- Check that the teacher completed registration with a valid join code
- Ensure the teacher is logged in with the correct account

#### Invitation Not Received
**Problem**: Teacher doesn't receive email invitation
**Solutions**:
- Check spam/junk folders
- Verify email address is correct
- Resend invitation from district dashboard
- Contact support if issue persists

### Getting Help

If you continue having issues:

1. **Check This Guide**: Review the relevant sections above
2. **Contact District Administrator**: For join codes and district-specific issues
3. **Verify Account Settings**: Ensure your profile is properly configured
4. **Contact Support**: Reach out with specific error messages and steps to reproduce

---

## Best Practices

### For District Administrators

#### Onboarding Teachers
- **Provide Clear Instructions**: Share this guide with teachers
- **Use Join Codes**: Encourage teachers to use join codes for self-registration
- **Follow Up**: Check that teachers successfully joined the district
- **Offer Support**: Be available to help with registration issues

#### Managing Your District
- **Regular Monitoring**: Check district dashboard regularly for new activity
- **School Communication**: Maintain communication with school administrators
- **Data Review**: Regularly review district reports and analytics
- **Growth Planning**: Plan for adding new schools and teachers

#### Security and Privacy
- **Protect Join Codes**: Share join codes securely and privately
- **Monitor Access**: Regularly review who has access to your district
- **Data Privacy**: Ensure compliance with student data privacy requirements
- **Access Control**: Use appropriate permissions for different user types

### For Teachers

#### Registration
- **Use Official Join Codes**: Only use join codes from your district administrator
- **Complete Registration**: Ensure all required fields are filled out
- **Verify School Name**: Use the exact school name as it appears in district records
- **Check Email**: Verify your email address is correct

#### Working in Districts
- **Follow District Guidelines**: Adhere to district policies and procedures
- **Collaborate**: Work with other teachers in your district
- **Report Issues**: Report problems to your district administrator
- **Stay Updated**: Keep up with district communications and updates

---

## Quick Reference

### District Administrator Actions
- **Create District**: Registration → School Plan → District Tab
- **Invite Teachers**: District → Teachers → Invite Teacher
- **View Reports**: District → Reports
- **Manage Settings**: District → Settings
- **Share Join Code**: District → Join Codes

### Teacher Actions
- **Join District**: Registration → Enter District Join Code
- **Accept Invitation**: Click invitation link → Complete registration
- **Access District Features**: Login → Navigate to district sections

### Common Join Code Formats
- **Format**: Usually 6-8 characters (letters and numbers)
- **Examples**: `ABC123`, `DIST456`, `SCH789`
- **Case Sensitive**: Always enter exactly as provided

---

*This guide is regularly updated. Check back for new features and improvements!*

For additional support, contact your district administrator or reach out to Sproutify Classrooms support.
