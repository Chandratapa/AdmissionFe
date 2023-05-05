import React, {  useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    FormControl,
    Select,
    FormLabel,
    FormControlLabel,
    RadioGroup,
    Radio
} from '@mui/material';

import moment from 'moment';


const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, category, gender }) => {
    const [values, setValues] = useState(() =>
        columns.reduce((acc, column) => {
            acc[column.accessorKey ?? ''] = '';
            return acc;
        }, {}),
    );
    const [errors, setErrors] = useState({});

    const validate = () => {
       
        const validationErrors = {};
       
        // if (!values.dateOfAdmission) {
        //     validationErrors.dateOfAdmission = 'Date of Admission is required';
        // }else if (moment(values.dateOfAdmission).isAfter()) {
        //     validationErrors.dateOfAdmission = 'Date of Admission cannot be in future';
        // }
        if (!values.name) {
            validationErrors.name = 'Name is required';
        }
        if (!values.gender) {
            validationErrors.gender = 'Gender is required';
        }
        if (!values.dateOfBirth) {
            validationErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!values.category) {
            validationErrors.category = 'Category is required';
        }
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const onCloseDialog =() => {
        setErrors({});
        onClose();
    }
    const handleSubmit = () => {
        //put your validation logic here
        console.log("handle submit");
        if (validate()) {
            onSubmit(values);
            onCloseDialog();
        }
    };

    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">Create New Account</DialogTitle>
            <DialogContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: '100%',
                            minWidth: { xs: '300px', sm: '360px', md: '400px' },
                            gap: '1.5rem',
                        }}
                    >
                        {columns.map((column) => {
                            if (column.accessorKey === 'name') {
                                return (
                                    <FormControl key={column.accessorKey}>
                                        <FormLabel>{column.header}</FormLabel>
                                    <TextField
                                        //key={column.accessorKey}
                                        //label={column.header}
                                        name={column.accessorKey}
                                        onChange={(e) =>
                                            setValues({ ...values, [e.target.name]: e.target.value })
                                        }
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        
                                    />
                                    </FormControl>
                                );
                            } else if (column.accessorKey === 'gender') {
                                return (
                                    <FormControl key={column.accessorKey} error={Boolean(errors.gender)}>
                                        <FormLabel>{column.header}</FormLabel>
                                        <RadioGroup
                                            name={column.accessorKey}
                                            onChange={(e) =>
                                                setValues({ ...values, [e.target.name]: e.target.value })
                                            }
                                        >
                                            <Stack direction="row">
                                                {gender.map((option) => (
                                                    <FormControlLabel key={option.id} value={option.id} control={<Radio />} label={option.genderType} />
                                                ))}
                                            </Stack>
                                        </RadioGroup>
                                        {Boolean(errors.gender) && <p className="MuiFormHelperText-root Mui-error MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-1wc848c-MuiFormHelperText-root">{errors.gender}</p>}
                                    </FormControl>
                                );
                            } else if (column.accessorKey === 'dateOfAdmission') {
                                return (
                                    <FormControl key={column.accessorKey}>
                                        <FormLabel>{column.header}</FormLabel>
                                    <TextField 
                                        //key={column.accessorKey}
                                        //label={column.header}
                                        name={column.accessorKey}
                                        type="text"
                                        value={moment().format('YYYY-MM-DD HH:mm')}
                                        onChange={(e) =>
                                            setValues({ ...values, [e.target.name]: e.target.value })
                                        }
                                        error={!!errors.dateOfAdmission}
                                        helperText={errors.dateOfAdmission}
                                        inputProps={{
                                            max: moment().format('YYYY-MM-DDTHH:mm'), // set max date to current date and time
                                        }}
                                        disabled
                                    />
                                    </FormControl>
                                );
                            } else if (column.accessorKey === 'dateOfBirth') {
                                return (
                                    <FormControl key={column.accessorKey} >
                                        <FormLabel>{column.header}</FormLabel>
                                    <TextField
                                        //key={column.accessorKey}
                                        //label={column.header}
                                        name={column.accessorKey}
                                        type="date"
                                        onChange={(e) =>
                                            setValues({ ...values, [e.target.name]: e.target.value })
                                        }
                                        inputProps={{
                                            max: moment().format('YYYY-MM-DD'), // set max date to current date and time
                                        }}
                                        error={!!errors.dateOfBirth}
                                        helperText={errors.dateOfBirth}
                                    />
                                    </FormControl>
                                );
                            }
                            else if (column.accessorKey === 'category') {
                                return (<FormControl key={column.accessorKey}  error={Boolean(errors.category)}>
                                    <FormLabel id="demo-simple-select-label">Category</FormLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={values.category}
                                        name="category"
                                        onChange={(e) =>
                                            setValues({ ...values, [e.target.name]: e.target.value })
                                        }
                                    >
                                        {category.map((state) => (
                                            <MenuItem key={state.id} value={state.categoryType}>
                                                {state.categoryType}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {Boolean(errors.category) && <p className="MuiFormHelperText-root Mui-error MuiFormHelperText-sizeMedium MuiFormHelperText-contained css-1wc848c-MuiFormHelperText-root">{errors.category}</p>}
                                </FormControl>
                                )
                            }
                            return null;
                        })}
                    </Stack>
                </form>


            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onCloseDialog}>Cancel</Button>
                <Button color="secondary" onClick={handleSubmit} variant="contained">
                    Create New Account
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default CreateNewAccountModal;