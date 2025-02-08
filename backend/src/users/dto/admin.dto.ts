import { ApiProperty } from '@nestjs/swagger';

export class FilterAdminDto {
    @ApiProperty({ description: 'Trang hiện tại', example: 1, required: false })
    page?: number;

    @ApiProperty({ description: 'Số lượng bản ghi trên mỗi trang', example: 10, required: false })
    limit?: number;

    @ApiProperty({
        description: 'Sắp xếp theo',
        example: 'first_name',
        required: false,
        enum: ['user_name', 'first_name', 'last_name', 'status', 'gender', 'district', 'province', 'created_at', 'updated_at'],
        enumName: 'SortByOptions'
    })
    sortBy?: string;

    @ApiProperty({
        description: 'Thứ tự sắp xếp',
        example: 'ASC',
        required: false,
        enum: ['ASC', 'DESC']
    })
    order?: 'ASC' | 'DESC';

    @ApiProperty({ description: 'Tìm kiếm bằng từ khóa', example: 'Định', required: false })
    search?: string;

    @ApiProperty({
        description: 'Giới tính',
        example: '1',
        required: false,
        enum: ['0', '1', 'null'],
        enumName: 'GenderOptions',
    })
    gender?: string;

    @ApiProperty({
        description: 'Quận/Huyện',
        example: 'BTHANH',
        required: false,
        enum: ['null', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'GVAP', 'PNHUAN', 'TDUC', 'BTHANH', 'BTAN', 'TBINH', 'TPHU', 'BCHANH', 'CGIO', 'CCHI', 'HMON', 'NBE', 'CGIUOC', 'DHOA', 'BLUC'],
        enumName: 'DistrictOptions',
    })
    district?: string;

    @ApiProperty({
        description: 'Thành phố/Tỉnh',
        example: 'HCM',
        required: false,
        enum: ['null', 'HCM', 'TDUC', 'LA'],
        enumName: 'ProvinceOptions',
    })
    province?: string;
}

export class CreateAdminDto {
    @ApiProperty({ description: 'Tên người dùng', example: 'admin123' })
    user_name: string;
  
    @ApiProperty({ description: 'Mật khẩu', example: 'password123' })
    password: string;
  
    @ApiProperty({ description: 'Tên', example: 'Hùng' })
    first_name: string;
  
    @ApiProperty({ description: 'Họ và chữ đệm', example: 'Nguyễn Thanh' })
    last_name: string;
  
    @ApiProperty({
      description: 'Giới tính',
      example: '0',
      required: false,
      enum: ['0', '1', 'null'],
      enumName: 'GenderOptions',
    })
    gender?: string;
  
    @ApiProperty({ description: 'Ngày sinh', example: '1990-01-01', required: false })
    dob?: Date;
  
    @ApiProperty({ description: 'Số điện thoại', example: '0123456789', required: false })
    phone_number?: string;
  
    @ApiProperty({ description: 'Email', example: 'admin@example.com', required: false })
    email?: string;
  
    @ApiProperty({ description: 'Địa chỉ', example: '123 Đường ABC', required: false })
    address?: string;
  
    @ApiProperty({ description: 'Quận/Huyện', example: 'BTHANH', required: false })
    district?: string;
  
    @ApiProperty({ description: 'Thành phố/Tỉnh', example: 'HCM', required: false })
    province?: string;
}

export class UpdateAdminDto {
    @ApiProperty({ description: 'Tên người dùng', example: 'admin123', required: false })
    user_name?: string;

    @ApiProperty({ description: 'Mật khẩu', example: 'newpassword123', required: false })
    password?: string;

    @ApiProperty({ description: 'Tên', example: 'Định', required: false })
    first_name?: string;

    @ApiProperty({ description: 'Họ và chữ đệm', example: 'Đào Thiên', required: false })
    last_name?: string;

    @ApiProperty({
        description: 'Giới tính',
        example: '1',
        required: false,
        enum: ['0', '1', 'null'],
        enumName: 'GenderOptions',
    })
    gender?: string;

    @ApiProperty({ description: 'Ngày sinh', example: '05/01/1996', required: false })
    dob?: Date;

    @ApiProperty({ description: 'Số điện thoại', example: '0928020098', required: false })
    phone_number?: string;

    @ApiProperty({ description: 'Email', example: 'admin@example.com', required: false })
    email?: string;

    @ApiProperty({ description: 'Trạng thái', example: 1, required: false })
    status?: number;

    @ApiProperty({ description: 'Địa chỉ', example: '123/13/3 Đường Thạnh Xuân 22, Phường Thạnh Xuân', required: false })
    address?: string;

    @ApiProperty({ description: 'Quận/Huyện', example: '12', required: false })
    district?: string;

    @ApiProperty({ description: 'Thành phố/Tỉnh', example: 'HCM', required: false })
    province?: string;
}

export class DeleteAdminsDto {
    @ApiProperty({
        description: 'Danh sách ID của admin cần xóa',
        example: [1, 2, 3],
        required: true
    })
    ids: number[];
}
