package com.fleetops.client.mapper;

import com.fleetops.client.Client;
import com.fleetops.client.dto.ClientDto;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public ClientDto toDto(Client entity) {
        if (entity == null) return null;
        
        return ClientDto.builder()
            .id(entity.getId())
            .name(entity.getName())
            .address(entity.getAddress())
            .contactPerson(entity.getContactPerson())
            .contractNo(entity.getContractNo())
            .subContractName(entity.getSubContractName())
            .subContractCode(entity.getSubContractCode())
            .vAddress(entity.getVAddress())
            .vPincode(entity.getVPincode())
            .vCity(entity.getVCity())
            .vState(entity.getVState())
            .vCountry(entity.getVCountry())
            .vContactPerson(entity.getVContactPerson())
            .vContactMobile(entity.getVContactMobile())
            .vContactEmail(entity.getVContactEmail())
            .vBillGstNo(entity.getVBillGstNo())
            .vBillingName(entity.getVBillingName())
            .vDeptName(entity.getVDeptName())
            .vBillAddress1(entity.getVBillAddress1())
            .vBillAddress2(entity.getVBillAddress2())
            .vBillPincode(entity.getVBillPincode())
            .vBillState(entity.getVBillState())
            .vBillCity(entity.getVBillCity())
            .vCcName(entity.getVCcName())
            .vBillCountry(entity.getVBillCountry())
            .vBillStaeCode(entity.getVBillStaeCode())
            .vBillKindAttn(entity.getVBillKindAttn())
            .vBillEmail(entity.getVBillEmail())
            .vBillMobile(entity.getVBillMobile())
            .vIntimationEmailIds(entity.getVIntimationEmailIds())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public Client toEntity(ClientDto dto) {
        if (dto == null) return null;

        return Client.builder()
            .id(dto.getId())
            .name(dto.getName())
            .address(dto.getAddress())
            .contactPerson(dto.getContactPerson())
            .contractNo(dto.getContractNo())
            .subContractName(dto.getSubContractName())
            .subContractCode(dto.getSubContractCode())
            .vAddress(dto.getVAddress())
            .vPincode(dto.getVPincode())
            .vCity(dto.getVCity())
            .vState(dto.getVState())
            .vCountry(dto.getVCountry())
            .vContactPerson(dto.getVContactPerson())
            .vContactMobile(dto.getVContactMobile())
            .vContactEmail(dto.getVContactEmail())
            .vBillGstNo(dto.getVBillGstNo())
            .vBillingName(dto.getVBillingName())
            .vDeptName(dto.getVDeptName())
            .vBillAddress1(dto.getVBillAddress1())
            .vBillAddress2(dto.getVBillAddress2())
            .vBillPincode(dto.getVBillPincode())
            .vBillState(dto.getVBillState())
            .vBillCity(dto.getVBillCity())
            .vCcName(dto.getVCcName())
            .vBillCountry(dto.getVBillCountry())
            .vBillStaeCode(dto.getVBillStaeCode())
            .vBillKindAttn(dto.getVBillKindAttn())
            .vBillEmail(dto.getVBillEmail())
            .vBillMobile(dto.getVBillMobile())
            .vIntimationEmailIds(dto.getVIntimationEmailIds())
            .build();
    }
}
