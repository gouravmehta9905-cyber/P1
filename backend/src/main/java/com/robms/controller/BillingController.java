package com.robms.controller;

import com.robms.model.Order;
import com.robms.model.TableEntity;
import com.robms.repository.OrderRepository;
import com.robms.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/table/{tableId}")
    public ResponseEntity<?> getBillForTable(@PathVariable Long tableId) {
        List<Order> unbilledOrders = orderRepository.findByTableIdAndStatusNot(tableId, "billed");
        if (unbilledOrders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BigDecimal subtotal = unbilledOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(item -> item.getPriceAtOrderTime().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")); // 5% tax
        BigDecimal total = subtotal.add(tax);

        return ResponseEntity.ok().body(new Object() {
            public final BigDecimal sub = subtotal;
            public final BigDecimal taxAmount = tax;
            public final BigDecimal grandTotal = total;
            public final List<Order> orders = unbilledOrders;
        });
    }

    @PostMapping("/checkout/{tableId}")
    public ResponseEntity<?> checkoutTable(@PathVariable Long tableId) {
        List<Order> unbilledOrders = orderRepository.findByTableIdAndStatusNot(tableId, "billed");
        unbilledOrders.forEach(order -> {
            order.setStatus("billed");
            Order billedOrder = orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/orders", billedOrder);
        });

        tableRepository.findById(tableId).ifPresent(table -> {
            table.setStatus("available");
            table.setCurrentBillAmount(BigDecimal.ZERO);
            tableRepository.save(table);
        });

        return ResponseEntity.ok().build();
    }
}
