# Routing Plan (No Auth)

## URL Structure

### Creator/Recruiter Views (Admin Routes)
- `/admin` - Dashboard (list all forms)
- `/admin/forms/new` - Create new form
- `/admin/forms/:id/edit` - Edit existing form
- `/admin/forms/:id/responses` - View all responses for a form
- `/admin/forms/:id/response/:responseId` - View single response

### Applicant Views (Public Routes)
- `/apply/:formId` - Fill out application form (public link)
- `/apply/:formId/success` - Confirmation page after submission

## Access Control Strategy

### Form Links
Each form has two types of links:
1. **Public Link** (`/apply/:formId`) - Anyone can access to fill out
   - Uses `public_id` (random token like `abc123xyz`)
2. **Admin Link** (`/admin/forms/:id/*`) - Only creators use
   - Uses form `id` (numeric)
   - No auth yet, but URL structure ready for future

### Link Generation
- **Public**: `https://yourapp.com/apply/abc123xyz`
- **Admin**: `https://yourapp.com/admin/forms/1/responses`

### Database Schema
- `forms.public_id` - For applicant access
- `forms.admin_id` - For admin access (future use)
- `forms.id` - Internal ID used in admin routes

## Frontend Structure

```
src/
  components/
    admin/
      FormBuilder.jsx
      FormList.jsx
      ResponseViewer.jsx
    applicant/
      ApplicationForm.jsx
      SuccessPage.jsx
  pages/
    AdminDashboard.jsx
    CreateForm.jsx
    EditForm.jsx
    ViewResponses.jsx
    ApplyForm.jsx
```

## Future Auth Integration
When adding auth later:
- Admin routes require login
- Public routes remain open
- Can add role-based access (creator vs viewer)
