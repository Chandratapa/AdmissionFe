import React, { useCallback, useMemo, useState, useEffect } from 'react';
import MaterialReactTable from 'material-react-table';
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import moment from 'moment';
import { Snackbar } from '@material-ui/core';
import CreateNewAccountModal from './CreateNewAccountModal';



const AdmissionTable = () => {

    async function fetchData() {
        try {
            console.log('came to fetch');
            const response = await fetch('http://localhost:8080/promed/api/v1/admissions');
            const jsonData = await response.json();
            const convertedData = jsonData.map(item => ({
                ...item,
                sourceSystemName: item.sourceSystemName === null ? '' : item.sourceSystemName,
                dateOfBirth: moment(item.dateOfBirth, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                //dateOfAdmission: moment(item.dateOfAdmission, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss'),
            }));


            setTableData(convertedData);

        } catch (error) {
            console.error(error);
            setErrorMessage('Error fetching data. Please try again later.');
        }
    };

    async function updateData(data) {
        const genderObject = gender.filter(item => item.genderType.toLowerCase() === data.gender.toLowerCase())[0];
        const categoryObject = category.filter(item => item.categoryType.toLowerCase() === data.category.toLowerCase())[0];
        const admission = {
            name: data.name,
            dateOfBirth: await convertDateFormat(data.dateOfBirth, 'YYYY-MM-DD', 'DD/MM/YYYY'),
            categoryId: categoryObject.id,
            genderId: genderObject.id,
            id: data.id
        }

        try {
            const response = await fetch('http://localhost:8080/promed/api/v1/admission', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(admission)
            });
            console.log('came before calling put')
            const responseData = await response.json();

            if (responseData.errorMessage) {
                const key = Object.keys(responseData.errors);
                const errorValues = Object.values(responseData.errors);
                //console.log(errorValues[0]);
                setErrorMessage(`${key} ${errorValues[0]}`);
            } else {
                setErrorMessage('');
            }

        } catch (error) {
            console.error(error);
            setErrorMessage('Error while updating data. Please try again later.');
        }
    }

    async function addData(data) {
        console.log(data);

        const categoryObject = category.filter(item => item.categoryType.toLowerCase() === data.category.toLowerCase())[0];
        const admission = {
            name: data.name,
            dateOfBirth: await convertDateFormat(data.dateOfBirth, 'YYYY-MM-DD', 'DD/MM/YYYY'),
            categoryId: categoryObject.id,
            genderId: data.gender,
            //dateOfAdmission: await convertDateFormat(data.dateOfAdmission, 'YYYY-MM-DDTHH:mm', 'DD/MM/YYYY HH:mm'),
        }

        try {
            const response = await fetch('http://localhost:8080/promed/api/v1/admission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(admission)
            });
            const responseData = await response.json();
            if (responseData.errorMessage) {
                const key = Object.keys(responseData.errors);
                const errorValues = Object.values(responseData.errors);
                //console.log(errorValues[0]);
                setErrorMessage(`${key} ${errorValues[0]}`);
            } else {
                setErrorMessage('');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Error while adding data. Please try again later.');
        }
    }

    async function deleteData(id) {

        try {
            const response = await fetch(`http://localhost:8080/promed/api/v1/admission?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            await response.json();
            setErrorMessage('');
        } catch (error) {
            console.error(error);
            setErrorMessage('Error while deleting data. Please try again later.');
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [category] = React.useState([
        { id: 1, categoryType: 'Normal' },
        { id: 2, categoryType: 'Inpatient' },
        { id: 3, categoryType: 'Emergency' },
        { id: 4, categoryType: 'Outpatient' },
    ]);
    const [gender] = React.useState([
        { id: 1, genderType: 'Male' },
        { id: 2, genderType: 'Female' },
        { id: 3, genderType: 'Intersex' },
        { id: 4, genderType: 'Unknown' },
    ]);
    const [tableData, setTableData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreateNewRow = async (values) => {
        await addData(values);
        await fetchData();

    };

    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            tableData[row.index] = values;
            await updateData(values);
            await fetchData();
            exitEditingMode(); //required to exit editing mode and close modal

        }
    };

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const handleDeleteRow = async (row) => {
        if (
            !window.confirm(`Are you sure you want to delete ${row.getValue('name')}`)
        ) {
            return;
        }

        await deleteData(row.getValue('id'));
        await fetchData();
    }


    const getCommonEditTextFieldProps = useCallback(
        (cell) => {
            return {
                error: !!validationErrors[cell.id],
                helperText: validationErrors[cell.id],
                onBlur: (event) => {
                    const isValid =
                        cell.column.id === 'name'
                            ? validateRequired(event.target.value)
                            : cell.column.id === 'dateOfBirth'
                                ? validateRequired(event.target.value)
                                : null;
                    if (!isValid) {
                        //set validation error for cell if invalid
                        setValidationErrors({
                            ...validationErrors,
                            [cell.id]: `${cell.column.columnDef.header} is required`,
                        });
                    } else {
                        //remove validation error for cell if valid
                        delete validationErrors[cell.id];
                        setValidationErrors({
                            ...validationErrors,
                        });
                    }
                },
            };
        },
        [validationErrors],
    );

    async function convertDateFormat(dateString, fromFormat, toFormat) {
        // Parse the input date string using moment.js
        return moment(dateString, fromFormat).format(toFormat);
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                // enableColumnOrdering: false,
                enableEditing: false, //disable editing on this column
                // enableSorting: false,
                enableHiding: false,
                hidden: true,

                size: 80,
                editable: 'never'
            },
            {
                accessorKey: 'dateOfAdmission',
                enableSorting: false,
                header: 'Date of Admission',
                size: 140,
                enableColumnOrdering: false,
                enableEditing: false, //disable editing on this column
                enableHiding: false,
                type: 'date',
                dateSetting: {
                    format: 'dd/MM/yyyy HH:mm'
                },
            },
            {
                accessorKey: 'name',
                header: 'Name',
                size: 140,
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    ...getCommonEditTextFieldProps(cell),
                }),
            },
            {
                accessorKey: 'dateOfBirth',
                header: 'Birth Date',
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    ...getCommonEditTextFieldProps(cell),
                    type: 'date',
                    inputProps: {
                        max: moment().format('YYYY-MM-DD'),
                    },
                    InputLabelProps: {
                        shrink: true,
                    },

                }),
            },
            {
                accessorKey: "gender",
                header: "Gender",
                size: 120,
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    select: true, //change to select for a dropdown
                    children: gender.map((gender) => (
                        <MenuItem key={gender.id} value={gender.genderType}>
                            {gender.genderType}
                        </MenuItem>
                    )),
                }),

            },
            {
                accessorKey: 'category',
                header: 'Category',
                enableEditing: (row) => {
                    return row.original.system !== 'External'; // disable the cell if system equals 'External'
                },
                muiTableBodyCellEditTextFieldProps: {
                    select: true, //change to select for a dropdown
                    children: category.map((state) => (
                        <MenuItem key={state.id} value={state.categoryType}>
                            {state.categoryType}
                        </MenuItem>
                    )),
                },
            },
            {
                accessorKey: 'sourceSystemName',
                header: 'Source System Identifier',
                enableEditing: false
            },
        ],
        [gender, category, getCommonEditTextFieldProps],
    );

    return (
        <>
            <Snackbar open={!!errorMessage} message={errorMessage} />
            <MaterialReactTable
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            align: 'center',
                        },
                        size: 120,
                    },
                }}
                state={{ isLoading: !tableData }}
                columns={columns}
                data={tableData}
                initialState={{ columnVisibility: { id: false, genderId: false } }}
                editingMode="modal" //default
                enableColumnOrdering={false}
                enableEditing
                enableBottomToolbar={false}
                enableColumnActions={false}
                enableGlobalFilterModes={false}
                onEditingRowSave={handleSaveRowEdits}
                onEditingRowCancel={handleCancelRowEdits}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton onClick={() => table.setEditingRow(row)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Delete">
                            <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button
                        color="secondary"
                        onClick={() => setCreateModalOpen(true)}
                        variant="contained"
                    >
                        Create New Admission
                    </Button>
                )}
            />

            <CreateNewAccountModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
                category={category}
                gender={gender}
            />

        </>
    );
};
export default AdmissionTable;



const validateRequired = (value) => !!value.length;
// const validateEmail = (email) =>
//     !!email.length &&
//     email
//         .toLowerCase()
//         .match(
//             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//         );
// const validateAge = (age) => age >= 18 && age <= 50;
