import { toOrdinal } from "@/libs/format";
import { ArrowBigDown, ArrowBigUp, ChessQueen, Clock, Crown, Medal, Star, Trophy } from "lucide-react";

const AttendanceSummaryList = ({ employees, search, selectedZone }) => {
    const checkUpOrDown = (rating, lastRating) => {
        if (rating > lastRating) {
            return <ArrowBigUp fill="green" strokeWidth={2} className="text-green-600" size={20} />;
        } else if (rating < lastRating) {
            return <ArrowBigDown fill="red" strokeWidth={2} className="text-red-600" size={20} />;
        } else {
            return "";
        }
    };

    const filteredSortedEmployees = employees
        ?.filter((employee) => {
            const matchSearch = employee.contact?.name?.toLowerCase().includes(search.toLowerCase());

            const matchZone =
                selectedZone === "" ||
                Number(employee.warehouse?.warehouse_zone_id) === Number(selectedZone) ||
                Number(employee.contact?.zone?.id) === Number(selectedZone);

            const hasRating = (employee.attendance_rating?.rating ?? 0) > 0;

            return matchSearch && matchZone && hasRating;
        })
        .sort((a, b) => b.attendance_rating?.rating - a.attendance_rating?.rating);

    if (filteredSortedEmployees?.length === 0) {
        return <div className="p-4">No employee found</div>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <table className="table-auto table w-full text-sm">
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Name</th>
                        <th>
                            <Star fill="orange" strokeWidth={2} className="text-yellow-600" size={20} />
                        </th>
                        <th>
                            <Clock fill="red" strokeWidth={2} className="text-red-300" size={20} />
                        </th>
                        <th colSpan={2}>Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSortedEmployees?.map((employee, index) => {
                        return (
                            <tr key={employee?.id}>
                                <td>{index + 1 === 1 ? <ChessQueen size={20} fill="yellow" className="text-yellow-600" /> : <>{toOrdinal(index + 1)}</>}</td>
                                <td>{employee?.contact?.name}</td>
                                <td className="text-center">{employee.attendance_rating?.good ?? 0}</td>
                                <td className="text-center">{employee.attendance_rating?.late ?? 0}</td>
                                <td className="text-center font-bold">
                                    {employee.attendance_rating?.rating ?? 0}
                                    <sub className="font-normal">/10</sub>
                                </td>
                                <td className="text-center">
                                    {checkUpOrDown(employee.attendance_rating?.rating ?? 0, employee.attendance_rating_last_month?.rating ?? 0)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="p-4">
                <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="flex flex-col items-center justify-center bg-amber-400 dark:bg-sky-900 rounded-t-3xl h-64">
                        <h1 className="font-black">2nd</h1>
                        <Medal size={50} fill="yellow" className="dark:text-yellow-600" />
                        <span className="text-3xl font-bold">{filteredSortedEmployees?.[1]?.attendance_rating?.rating ?? 0}</span>
                        <h1 className="font-bold bg-amber-600 dark:bg-sky-700 text-xs px-2 rounded-full text-white my-2">
                            {filteredSortedEmployees?.[1]?.contact?.name ?? ""}
                        </h1>
                        <div className="flex items-center justify-evenly w-full gap-1">
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Star fill="orange" strokeWidth={2} className="text-yellow-100 dark:text-yellow-300" size={30} />
                                {filteredSortedEmployees?.[1]?.attendance_rating?.good ?? 0}
                            </div>
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Clock fill="red" strokeWidth={2} className="text-red-100" size={30} />
                                {filteredSortedEmployees?.[1]?.attendance_rating?.late ?? 0}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-amber-400 dark:bg-sky-900 rounded-t-3xl h-96">
                        <h1 className="font-black">1st</h1>
                        <Trophy size={100} fill="yellow" className="dark:text-yellow-600" />
                        <span className="text-4xl font-bold">{filteredSortedEmployees?.[0]?.attendance_rating?.rating ?? 0}</span>
                        <h1 className="font-bold bg-amber-600 dark:bg-sky-700 text-sm px-2 rounded-full text-white my-2">
                            {filteredSortedEmployees?.[0]?.contact?.name ?? ""}
                        </h1>
                        <div className="flex items-center justify-evenly w-full gap-1">
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Star fill="orange" strokeWidth={2} className="text-yellow-100 dark:text-yellow-300" size={40} />
                                {filteredSortedEmployees?.[0]?.attendance_rating?.good ?? 0}
                            </div>
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Clock fill="red" strokeWidth={2} className="text-red-100" size={40} />
                                {filteredSortedEmployees?.[0]?.attendance_rating?.late ?? 0}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-amber-400 dark:bg-sky-900 rounded-t-3xl h-52">
                        <h1 className="font-black">3rd</h1>
                        <Medal size={40} fill="yellow" className="dark:text-yellow-600" />
                        <span className="text-2xl font-bold">{filteredSortedEmployees?.[2]?.attendance_rating?.rating ?? 0}</span>
                        <h1 className="font-bold bg-amber-600 dark:bg-sky-700 text-xs px-2 rounded-full text-white my-2">
                            {filteredSortedEmployees?.[2]?.contact?.name ?? ""}
                        </h1>
                        <div className="flex items-center justify-evenly w-full gap-1">
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Star fill="orange" strokeWidth={2} className="text-yellow-100 dark:text-yellow-300" size={30} />
                                {filteredSortedEmployees?.[2]?.attendance_rating?.good ?? 0}
                            </div>
                            <div className="flex flex-col items-center gap-1 font-bold">
                                <Clock fill="red" strokeWidth={2} className="text-red-100" size={30} />
                                {filteredSortedEmployees?.[2]?.attendance_rating?.late ?? 0}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSummaryList;
