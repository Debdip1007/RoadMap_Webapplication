import * as yup from 'yup';

export const goalSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority').required('Priority is required'),
  deadline: yup.date().nullable(),
  tags: yup.array().of(yup.string())
});

export const authSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().when('password', {
    is: (password: string) => password && password.length > 0,
    then: (schema) => schema.oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
    otherwise: (schema) => schema.notRequired()
  })
});

export const pythonImportSchema = yup.object({
  roadmap_type: yup.string().required(),
  title: yup.string().required(),
  weeks: yup.array().of(
    yup.object({
      week: yup.string().required(),
      focus: yup.string().required(),
      topics: yup.array().of(yup.string()).required(),
      goals: yup.array().of(yup.string()).required(),
      deliverables: yup.array().of(yup.string()).required(),
      reference: yup.array().of(
        yup.object({
          type: yup.string().required(),
          title: yup.string(),
          url: yup.string().url()
        })
      )
    })
  ).required()
});