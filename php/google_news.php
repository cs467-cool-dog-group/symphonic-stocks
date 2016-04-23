
<?php
if(isset($_POST['company'])) {
    $company = $_POST['company'];
    $stock_date = $_POST['stock_date'];
?>
	<script>
    var company = '<?php echo $company;?>';
    var stock_date = '<?php echo $stock_date;?>';
    </script>
    <?php
    die();
    
}
?>