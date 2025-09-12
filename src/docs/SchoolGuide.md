# School Management Guide 🏫

A comprehensive guide to managing schools in Sproutify Classrooms, including teacher onboarding, classroom management, and school-wide analytics.

---

## Table of Contents

- [What is a School Plan?](#what-is-a-school-plan)
- [Getting Started](#getting-started)
  - [Creating a School Account](#creating-a-school-account)
  - [School Administrator Setup](#school-administrator-setup)
- [Teacher Onboarding](#teacher-onboarding)
  - [Method 1: Email Invitations](#method-1-email-invitations)
  - [Method 2: School Join Codes](#method-2-school-join-codes)
- [Managing Your School](#managing-your-school)
- [School Features](#school-features)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## What is a School Plan?

A **school plan** in Sproutify Classrooms is designed for individual schools to manage their aeroponic garden programs. School plans provide:

- **Single School Management**: School administrators oversee all teachers and classrooms within their school
- **Teacher Management**: Invite and manage teachers within your school
- **Classroom Oversight**: Monitor all classrooms and student activity
- **School Analytics**: Comprehensive reporting and insights for your school
- **Scalable Growth**: Add teachers and classrooms as your program expands

### School Hierarchy

```
School
├── Teacher 1
│   ├── Classroom A
│   │   ├── Student 1
│   │   ├── Student 2
│   │   └── Student 3
│   └── Tower 1
├── Teacher 2
│   ├── Classroom B
│   │   ├── Student 4
│   │   └── Student 5
│   └── Tower 2
└── Teacher 3
    ├── Classroom C
    └── Tower 3
```

### School vs District Plans

| Feature | School Plan | District Plan |
|---------|-------------|---------------|
| **Scope** | Single school | Multiple schools |
| **Teacher Onboarding** | Email invitations + School join codes | Email invitations + District join codes |
| **Management Level** | School administrator | District administrator |
| **Reports** | School-wide analytics | District-wide analytics |
| **Join Codes** | School-level codes for teachers | District-level codes for schools |

---

## Getting Started

### Creating a School Account

To create a school account:

1. **Navigate to Registration**: Go to the Sproutify Classrooms registration page
2. **Select School Plan**: Choose the "School" subscription plan
3. **Choose School Tab**: Select "School" in the registration form
4. **Enter School Information**:
   - School name (e.g., "Roosevelt Elementary School")
   - Administrator contact information
   - Billing details
5. **Complete Registration**: Finish the signup process

After registration, you'll receive:
- School administrator access
- Access to school management features
- Ability to invite teachers

### School Administrator Setup

Once your school account is created:

1. **Access School Dashboard**: Log in and navigate to `/school`
2. **Configure School Settings**: Update school information and settings
3. **Invite Teachers**: Start adding teachers to your school
4. **Set Up Classrooms**: Help teachers organize their classrooms

---

## Teacher Onboarding

There are two primary ways to add teachers to your school:

### Method 1: Email Invitations

**Best for**: Individual teacher invitations when you have specific teacher information

#### For School Administrators:
1. **Navigate to Teachers**: Go to School → Teachers
2. **Click "Invite Teacher"**: Open the invitation dialog
3. **Enter Teacher Information**:
   - Teacher's email address
   - Full name (optional)
4. **Send Invitation**: The system generates an invitation link
5. **Share Link**: Send the invitation link to the teacher

#### For Teachers:
1. **Receive Invitation**: Check your email for the invitation link
2. **Click Link**: Follow the invitation link to the registration page
3. **Complete Registration**: Fill out the form with your information
4. **Automatic Setup**: You'll be automatically added to the school

### Method 2: School Join Codes

**Best for**: Teachers who want to self-register or when you want to share codes broadly

#### For School Administrators:
1. **Navigate to Join Codes**: Go to School → Join Codes
2. **Create New Code**: Click "Create Code"
3. **Configure Code Settings**:
   - Generate or customize the code
   - Set maximum uses (optional)
   - Set expiration date (optional)
4. **Share Code**: Provide the code to teachers

#### For Teachers:
1. **Get School Join Code**: Obtain the code from your school administrator
2. **Register with Code**: During teacher registration:
   - Enter your personal information
   - Enter your school name
   - **Enter the school join code** in the appropriate field
   - Complete registration
3. **Automatic Linking**: You'll be automatically linked to the school

#### Visual Guide:
```
┌─ Teacher Registration Form ─────────────────┐
│ First Name: [Jane]                         │
│ Last Name: [Smith]                         │
│ School Name: [Roosevelt Elementary]        │
│ School Join Code: [SCH123] ← Enter here!   │
│ Email: [jane@school.edu]                   │
│ Password: [••••••••]                        │
└─────────────────────────────────────────────┘
```

---

## Managing Your School

### School Dashboard

The school dashboard provides:
- **Total Towers**: Number of aeroponic towers at your school
- **Total Classrooms**: Number of participating classrooms
- **Total Students**: Number of enrolled students
- **Recent Activity**: Chart showing submissions over the last 14 days

### Teacher Management

- **View All Teachers**: See all teachers in your school
- **Search and Filter**: Find specific teachers by name or email
- **Invite New Teachers**: Send invitations to new teachers
- **Remove Teachers**: Unassign teachers from your school
- **Teacher Activity**: Monitor teacher engagement and activity

### Classroom Oversight

- **View All Classrooms**: See classrooms across all teachers
- **Monitor Activity**: Track classroom participation and progress
- **Student Management**: Oversee student enrollment and activity
- **Tower Management**: Monitor tower setup and maintenance

### Join Code Management

- **Create Codes**: Generate new join codes for teachers
- **Manage Codes**: Set usage limits and expiration dates
- **Track Usage**: Monitor how many times codes have been used
- **Deactivate Codes**: Turn off codes when no longer needed

---

## School Features

### Dashboard Overview

The school dashboard provides:
- **Activity Metrics**: Towers, classrooms, students, and submissions
- **Recent Activity Chart**: Visual representation of school activity over time
- **Quick Actions**: Links to key school management functions

### Teacher Management

- **Teacher List**: View all teachers with search and filter capabilities
- **Invitation System**: Send email invitations to new teachers
- **Join Code System**: Create and manage join codes for teacher self-registration
- **Teacher Removal**: Unassign teachers from your school

### Reporting and Analytics

- **School Reports**: Comprehensive reports for your school
- **Activity Tracking**: Monitor submissions and engagement
- **Performance Metrics**: Track tower productivity and student engagement
- **Export Data**: Export reports for external analysis

### Settings and Configuration

- **School Information**: Update school name and contact details
- **Join Code Management**: Create, manage, and track join codes
- **Subscription Management**: Manage school subscription and billing
- **Privacy Settings**: Configure data sharing and privacy options

---

## Troubleshooting

### Common Issues

#### Teacher Invitation Not Received
**Problem**: Teacher doesn't receive email invitation
**Solutions**:
- Check spam/junk folders
- Verify email address is correct
- Resend invitation from school dashboard
- Contact support if issue persists

#### Invalid School Join Code
**Problem**: Teacher receives "Invalid join code" error
**Solutions**:
- Verify the code with your school administrator
- Check for typos (codes are case-sensitive)
- Ensure the code hasn't expired
- Check if the code has reached its usage limit

#### Teacher Not Linked to School
**Problem**: Teacher exists but isn't linked to your school
**Solutions**:
- The system automatically links teachers when they register with valid join codes
- Contact support if automatic linking fails
- Manually assign the teacher through the teacher management interface

#### Missing School Features
**Problem**: Teacher doesn't see school features after registration
**Solutions**:
- Verify the teacher's profile has `school_id` set
- Check that the teacher completed registration with a valid join code
- Ensure the teacher is logged in with the correct account

### Getting Help

If you continue having issues:

1. **Check This Guide**: Review the relevant sections above
2. **Contact School Administrator**: For join codes and school-specific issues
3. **Verify Account Settings**: Ensure your profile is properly configured
4. **Contact Support**: Reach out with specific error messages and steps to reproduce

---

## Best Practices

### For School Administrators

#### Onboarding Teachers
- **Provide Clear Instructions**: Share this guide with teachers
- **Use Both Methods**: Combine email invitations with join codes for flexibility
- **Follow Up**: Check that teachers successfully joined your school
- **Offer Support**: Be available to help with registration issues

#### Managing Your School
- **Regular Monitoring**: Check school dashboard regularly for new activity
- **Teacher Communication**: Maintain communication with teachers
- **Data Review**: Regularly review school reports and analytics
- **Growth Planning**: Plan for adding new teachers and classrooms

#### Security and Privacy
- **Protect Join Codes**: Share join codes securely and privately
- **Monitor Access**: Regularly review who has access to your school
- **Data Privacy**: Ensure compliance with student data privacy requirements
- **Access Control**: Use appropriate permissions for different user types

### For Teachers

#### Registration
- **Use Official Join Codes**: Only use join codes from your school administrator
- **Complete Registration**: Ensure all required fields are filled out
- **Verify School Name**: Use the exact school name as it appears in school records
- **Check Email**: Verify your email address is correct

#### Working in Schools
- **Follow School Guidelines**: Adhere to school policies and procedures
- **Collaborate**: Work with other teachers in your school
- **Report Issues**: Report problems to your school administrator
- **Stay Updated**: Keep up with school communications and updates

---

## Quick Reference

### School Administrator Actions
- **Create School**: Registration → School Plan → School Tab
- **Invite Teachers**: School → Teachers → Invite Teacher
- **Create Join Codes**: School → Join Codes → Create Code
- **View Reports**: School → Reports
- **Manage Settings**: School → Settings

### Teacher Actions
- **Join School**: Registration → Enter School Join Code
- **Accept Invitation**: Click invitation link → Complete registration
- **Access School Features**: Login → Navigate to school sections

### Common Join Code Formats
- **Format**: Usually 6-8 characters (letters and numbers)
- **Examples**: `SCH123`, `TEACH456`, `ROOSE789`
- **Case Sensitive**: Always enter exactly as provided

---

*This guide is regularly updated. Check back for new features and improvements!*

For additional support, contact your school administrator or reach out to Sproutify Classrooms support.
