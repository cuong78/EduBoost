package com.fptu.eduBoostBackend.repositories;

import com.fptu.eduBoostBackend.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByCode(String code);
    Optional<Permission> findByName(String name);
    boolean existsByCode(String code);
}
