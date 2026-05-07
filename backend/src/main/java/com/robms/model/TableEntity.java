package com.robms.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "restaurant_tables")
public class TableEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String status; // 'available', 'occupied', 'billed', 'reserved'

    @Column(nullable = false)
    private Integer capacity;

    private BigDecimal currentBillAmount;

    // Constructors
    public TableEntity() {}

    public TableEntity(String name, String status, Integer capacity) {
        this.name = name;
        this.status = status;
        this.capacity = capacity;
        this.currentBillAmount = BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public BigDecimal getCurrentBillAmount() { return currentBillAmount; }
    public void setCurrentBillAmount(BigDecimal currentBillAmount) { this.currentBillAmount = currentBillAmount; }
}
