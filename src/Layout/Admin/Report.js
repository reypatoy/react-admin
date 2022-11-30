import { useEffect, useState, useRef } from 'react';
import reportData from './reportData';
import { db } from "../../firebase-config";
import { collection,getDocs, query, where,onSnapshot } from "firebase/firestore";
import { UserAuth } from "../../context/authContext";
import { useReactToPrint } from "react-to-print";

function Report() {
    const [category, setCategory] = useState('');
    const [isMonthly, setIsMonthly] = useState(true);
    const [isGenerated, setIsGenerated] = useState(false);
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [customerData, setCustomerData] = useState([]);
    const [billData, setBillData] = useState([]);
    const [dataForPrint, setdataForPrint] = useState([]);
    const [totalReading, setTotalReading] = useState(0);
    const [totalAmmount, setTotalAmmount] = useState(0);
    const [totalPenalty, setTotalPenalty] = useState(0);
    const [totalPayed, setTotalPayed] = useState(0);
    
    useEffect(() => {
        getCustomer();
        getBills();
    },[])
    const getCustomer = async () => {
        const q = query(collection(db, "customers"), where("approve", "==", true));
        onSnapshot(q, (query) => {
            let allData = [];
            query.forEach((doc) => {
                    allData.push(doc.data());
            });
            setCustomerData(allData);
        });
    }
    const getBills = async () => {
        const q = query(collection(db, "bills"));
        onSnapshot(q, (query) => {
            let allData = [];
            query.forEach((doc) => {
                    allData.push(doc.data());
            });
            setBillData(allData);
        });
    }
    const selectCategory = (e) => {
        setCategory(e);
        if(e === 'Monthly'){
            setIsMonthly(true);
        }
        else{
            setIsMonthly(false);
        }
    }
    const setMonthValue = (e) => {
        setMonth(e);
    }
    const setYearValue = (e) => {
        setYear(e);
    }
    const generateReport = async (c, b) => {
        if(category === ''){
            alert('Please select a category');
            return;
        }
        else if(category === 'Monthly'){
            if(month === '' || year === ''){
                alert('Please select a month and year');
                return;
            }
            else{
                let monthString = '';
                const monthInteger = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month) + 1;
                if(monthInteger < 10){
                    monthString = '0' + monthInteger;
                }else{
                    monthString = monthInteger;
                }

                let tempList = [];
                setdataForPrint([]);

                setTotalReading(0);
                setTotalAmmount(0);
                setTotalPenalty(0);
                setTotalPayed(0);

                let totalTeading = 0;
                let totalAmmount = 0;
                let totalPenalty = 0;
                let totalPayed = 0;

                b.forEach((customer) => {
                    const dataArray = customer.date.split('-');
                    if(dataArray[0] === monthString.toString() && dataArray[2] === year.toString()){
                        totalTeading += parseInt(customer.reading);
                        totalAmmount += parseInt(customer.bill);
                        totalPenalty += parseInt(customer.penalty);
                        totalPayed += parseInt(customer.totalPayable);
                        tempList.push({
                            name: customer.customerName,
                            address: customer.address,
                            phone: customer.contact,
                            total: customer.totalPayable,
                            penalty: customer.penalty,
                            dueDate: customer.date,
                            bill: customer.bill,
                            reading: customer.reading
                            });
                    }
                });
                setTotalReading(totalTeading);
                setTotalAmmount(totalAmmount);
                setTotalPenalty(totalPenalty);
                setTotalPayed(totalPayed);
                setdataForPrint(tempList);
                setIsGenerated(true);
                return;
            }
        }
        else{
            if(year === ''){
                alert('Please select a year');
                return;
            }
            else{

                let tempList = [];
                setdataForPrint([]);

                setTotalReading(0);
                setTotalAmmount(0);
                setTotalPenalty(0);
                setTotalPayed(0);

                let totalTeading = 0;
                let totalAmmount = 0;
                let totalPenalty = 0;
                let totalPayed = 0;
                
                b.forEach((customer) => {
                    const dataArray = customer.date.split('-');
                    if(dataArray[2] === year.toString()){
                        totalTeading += parseInt(customer.reading);
                        totalAmmount += parseInt(customer.bill);
                        totalPenalty += parseInt(customer.penalty);
                        totalPayed += parseInt(customer.totalPayable);
                        tempList.push({
                            name: customer.customerName,
                            address: customer.address,
                            phone: customer.contact,
                            total: customer.totalPayable,
                            penalty: customer.penalty,
                            dueDate: customer.date,
                            bill: customer.bill,
                            reading: customer.reading
                            });
                    }
                });
                setTotalReading(totalTeading);
                setTotalAmmount(totalAmmount);
                setTotalPenalty(totalPenalty);
                setTotalPayed(totalPayed);
                setdataForPrint(tempList);
                setIsGenerated(true);
                return;
            }
        }
    }

    const dataToPrintRef = useRef();
    const handlePrint = useReactToPrint({
      content: () => dataToPrintRef.current
    });
    return(
        <div className="reportsContainer">
            <div className="title">
                <h1>Reports</h1>
                <select 
                    onChange={(event) => selectCategory(event.target.value)}
                    value={category}
                >
                    <option>--Select Category--</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                </select>
                {isMonthly &&
                    <select onChange={(event) => setMonthValue(event.target.value)}
                        value={month}
                    >
                        <option>--Please Select Month--</option>
                        {reportData.months.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                }
                <select onChange={(event) => setYearValue(event.target.value)}
                        value={year}
                >
                    <option>--Please Select Year--</option>
                    {reportData.years.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                    ))}
                </select>
                <button onClick={() => generateReport(customerData, billData)}>Generate Report</button>
            </div>
            <div ref={dataToPrintRef} className="reports">
                {isGenerated &&
                    <div className="report">
                            <h1>Report</h1>
                            <span>Category: {category}</span>
                            {isMonthly &&
                                <span>Month: {month}</span>
                            }
                            <span>Year: {year}</span>
                    </div>
                }
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Purok</th>
                            <th>Contact</th>
                            <th>Reading</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Penalty</th>
                            <th>Total Payable/Payed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataForPrint.length > 0 ? dataForPrint.map((data, index) => (
                            <tr key={index}>
                                <td className="align-left">{data.name}</td>
                                <td className="align-left">{data.address}</td>
                                <td className="align-right">{data.phone}</td>
                                <td className="align-right">{data.reading}m<sup>3</sup></td>
                                <td className="align-right">{parseInt(data.bill).toLocaleString()}.00</td>
                                <td className="align-right">{data.dueDate}</td>
                                <td className="align-right">{parseInt(data.penalty).toLocaleString()}.00</td>
                                <td className="align-right">{parseInt(data.total).toLocaleString()}.00</td>
                            </tr>
                        )) : <tr>
                                <td colSpan={8}>No Data</td>
                            </tr>
                        }
                        {dataForPrint.length > 0 &&
                            <tr>
                                <th colSpan={3}>Total</th>
                                <th className="align-right">{parseInt(totalReading).toLocaleString()}m<sup>3</sup></th>
                                <th className="align-right">{parseInt(totalAmmount).toLocaleString()}.00</th>
                                <th></th>
                                <th className="align-right">{totalPenalty}.00</th>
                                <th className="align-right">{parseInt(totalPayed).toLocaleString()}.00</th>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
            {isGenerated && dataForPrint.length > 0 &&
                <div className='print-container'>
                        <button onClick={handlePrint}>Print</button>;
                </div>
            }
        </div>
    );
}

export default Report;