import { useCallback, useEffect, useState } from 'react';
import { Spinner, Table } from 'react-bootstrap';
import useAccount from '../../../../hooks/useAccount';
import { User } from '../../../../models/User';
import { RequestApproval } from '../../../../models/RequestApproval';
import { getRequestByRoleOfSender } from '../../../../api/RequestApprovalAPI';
import { PaginationControl } from 'react-bootstrap-pagination-control'
import RequestSingle from './RequestSingle';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const RequestWaitlist = () => {
  const token = localStorage.getItem("access_token");
  const user = useAccount(token);

  //
  const [listRequests, setListRequests] = useState<RequestApproval[]>([]);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [userState, setUserState] = useState<User | null>(user);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setUserState(user);
  }, [user]);

  const handleChangeList = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getRequestByRoleOfSender('STAFF', page);
      setListRequests(response.requestsData);
      setTotalElements(response.totalElements);
    } catch (error) {
      // console.error(error);
    }
    setLoading(false)
  }, [page]);

  useEffect(() => {
    handleChangeList();
  }, [user, page, handleChangeList]);


  return (
    <>
      <section className="main_content dashboard_part">
        <div className="main_content_iner ">
          <div className="container-fluid plr_30 body_white_bg pt_30">
            <div className="row justify-content-center" style={{ padding: "40px 0px 0px 350px" }}>
              <div className="col-12">
                <div className="breadcrumb-area">
                  <Link to="/manager">Trang chủ  / </Link>
                  <Link to="/manager/yeu-cau-dau-gia">Danh sách các yêu cầu đấu giá</Link>
                </div>
                <div className="QA_section">
                  <div className="white_box_tittle list_header">
                    <h4>Các yêu cầu đấu giá</h4>
                    <div className="box_right d-flex lms_block">
                      <div className="serach_field_2">
                      </div>
                    </div>
                  </div>
                  <div className=" ">
                    <Table striped bordered hover>
                      <thead>
                        <tr className=''>
                          <th scope="col">Mã yêu cầu</th>
                          <th scope="col">Mã tài sản</th>
                          <th scope="col">Phân loại</th>
                          <th scope="col">Định giá (VND)</th>
                          <th scope="col">Thời gian yêu cầu</th>
                          <th scope="col">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center">
                              <Spinner animation="border" />
                            </td>
                          </tr>

                        ) : (listRequests.length > 0 ? (listRequests.map((request) => (
                          <RequestSingle key={request.id} request={request} user={userState} handleChangeList={handleChangeList} />

                        ))) : (<td colSpan={7} className="text-center">
                          <h5 className='fw-semibold lh-base mt-2'>Không có yêu cầu nào được gửi đến</h5>
                        </td>))
                        }
                      </tbody>
                    </Table>
                  </div>


                  <PaginationControl
                    page={page}
                    between={5}
                    total={totalElements}
                    limit={5}
                    changePage={(page) => {
                      setPage(page);
                    }}
                    ellipsis={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default RequestWaitlist;
